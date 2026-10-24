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

/**
 * Keyless public catalog search. Roughly 20 requests/minute per IP, so callers
 * debounce and we cache every term we have seen.
 */
export class ItunesSearchProvider implements SongSearchProvider {
  private cache = new Map<string, Song[]>()

  constructor(private fetchFn: typeof fetch = (...args) => fetch(...args)) {}

  async search(term: string, signal?: AbortSignal): Promise<Song[]> {
    const q = term.trim().toLowerCase()
    if (q.length < MIN_SEARCH_LENGTH) return []
    const cached = this.cache.get(q)
    if (cached) return cached
    const url =
      'https://itunes.apple.com/search?' +
      new URLSearchParams({ term: q, entity: 'song', media: 'music', limit: '25' })
    const res = await this.fetchFn(url, { signal })
    if (!res.ok) throw new Error(`Song search failed (${res.status})`)
    const songs = mapItunesResults(await res.json())
    if (this.cache.size > 200) this.cache.clear()
    this.cache.set(q, songs)
    return songs
  }
}
