import { songKey } from './songKey'
import type { Song } from './types'

export interface SongSearchProvider {
  search(term: string, signal?: AbortSignal): Promise<Song[]>
}

export const MIN_SEARCH_LENGTH = 2
export const SEARCH_DEBOUNCE_MS = 350
const RESULT_LIMIT = 8

/** Build a Song from free text, for when search is down or the song isn't in the catalog. */
export function manualSong(title: string, artist: string): Song {
  const t = title.trim()
  const a = artist.trim()
  return { key: songKey(t, a), title: t, artist: a, source: 'manual' }
}

interface ItunesTrack {
  wrapperType?: string
  kind?: string
  trackId?: number
  trackName?: string
  artistName?: string
  artworkUrl100?: string
}

/** Map an iTunes Search API response to Songs, deduping editions of the same song. */
export function mapItunesResults(json: unknown, limit = RESULT_LIMIT): Song[] {
  const results = (json as { results?: ItunesTrack[] } | null)?.results
  if (!Array.isArray(results)) return []
  const seen = new Set<string>()
  const songs: Song[] = []
  for (const r of results) {
    if (r.kind && r.kind !== 'song') continue
    if (!r.trackName || !r.artistName) continue
    const key = songKey(r.trackName, r.artistName)
    if (seen.has(key)) continue
    seen.add(key)
    songs.push({
      key,
      title: r.trackName,
      artist: r.artistName,
      artworkUrl: r.artworkUrl100?.replace(/100x100bb/, '200x200bb'),
      source: 'itunes',
    })
    if (songs.length >= limit) break
  }
  return songs
}

/** Loads a URL and resolves with its parsed JSON body. */
export type JsonTransport = (url: string, signal?: AbortSignal) => Promise<unknown>

const JSONP_TIMEOUT_MS = 6000
let jsonpSeq = 0

/**
 * Load JSON through a <script> tag with a `callback` parameter (JSONP). The
 * iTunes Search API doesn't send CORS headers, so a plain fetch() from another
 * website is blocked by the browser; Apple documents JSONP for browser use.
 */
export function jsonp(url: string, signal?: AbortSignal, timeoutMs = JSONP_TIMEOUT_MS): Promise<unknown> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('Aborted', 'AbortError'))
    const w = window as unknown as Record<string, unknown>
    const name = `__wsbJsonp${Date.now().toString(36)}_${jsonpSeq++}`
    const script = document.createElement('script')
    let settled = false

    const finish = () => {
      settled = true
      clearTimeout(timer)
      signal?.removeEventListener('abort', onAbort)
      script.remove()
      // A late response must not hit an undefined function.
      w[name] = () => {}
      setTimeout(() => delete w[name], 60_000)
    }
    const fail = (err: Error) => {
      if (settled) return
      finish()
      reject(err)
    }
    const onAbort = () => fail(new DOMException('Aborted', 'AbortError'))
    const timer = setTimeout(() => fail(new Error('Song search timed out')), timeoutMs)

    w[name] = (data: unknown) => {
      if (settled) return
      finish()
      resolve(data)
    }
    script.onerror = () => fail(new Error('Song search could not load'))
    script.async = true
    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${name}`
    signal?.addEventListener('abort', onAbort)
    document.head.appendChild(script)
  })
}

export async function fetchJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Song search failed (${res.status})`)
  return res.json()
}

/** JSONP first (works without CORS); plain fetch as a backup. */
export const defaultTransport: JsonTransport = async (url, signal) => {
  try {
    return await jsonp(url, signal)
  } catch (jsonpError) {
    if (signal?.aborted) throw jsonpError
    try {
      return await fetchJson(url, signal)
    } catch (fetchError) {
      if (signal?.aborted) throw fetchError
      const why = (e: unknown) => (e instanceof Error ? e.message : String(e))
      throw new Error(`${why(jsonpError)}; ${why(fetchError)}`, { cause: fetchError })
    }
  }
}

/**
 * Keyless public catalog search. Roughly 20 requests/minute per IP, so callers
 * debounce and we cache every term we have seen.
 */
export class ItunesSearchProvider implements SongSearchProvider {
  private cache = new Map<string, Song[]>()

  constructor(private transport: JsonTransport = defaultTransport) {}

  async search(term: string, signal?: AbortSignal): Promise<Song[]> {
    const q = term.trim().toLowerCase()
    if (q.length < MIN_SEARCH_LENGTH) return []
    const cached = this.cache.get(q)
    if (cached) return cached
    const url =
      'https://itunes.apple.com/search?' +
      new URLSearchParams({ term: q, entity: 'song', media: 'music', limit: '25' })
    const songs = mapItunesResults(await this.transport(url, signal))
    if (this.cache.size > 200) this.cache.clear()
    this.cache.set(q, songs)
    return songs
  }
}
