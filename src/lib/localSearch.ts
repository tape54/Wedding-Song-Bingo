import { WEDDING_SONGS } from '../data/weddingSongs'
import { normalizeTitle, primaryArtist, songKey, squash } from './songKey'
import type { Song } from './types'

interface Indexed {
  song: Song
  title: string
  fullTitle: string
  artist: string
}

let index: Indexed[] | null = null

function getIndex(): Indexed[] {
  if (index) return index
  const seen = new Set<string>()
  index = []
  for (const { title, artist } of WEDDING_SONGS) {
    const key = songKey(title, artist)
    if (seen.has(key)) continue
    seen.add(key)
    index.push({
      // Built-in songs are stored like hand-typed ones; the key is what matters.
      song: { key, title, artist, source: 'manual' },
      title: normalizeTitle(title),
      fullTitle: squash(title),
      artist: primaryArtist(artist) + ' ' + squash(artist),
    })
  }
  return index
}

const startsWord = (hay: string, w: string) => hay.startsWith(w) || hay.includes(' ' + w)

/** Instant, offline search over the built-in catalog of popular wedding songs. */
export function searchLocal(term: string, limit = 8): Song[] {
  const q = squash(term)
  if (q.length < 2) return []
  const words = q.split(' ').filter(Boolean)
  const scored: { song: Song; score: number }[] = []
  for (const e of getIndex()) {
    const hay = `${e.fullTitle} ${e.artist}`
    if (!words.every((w) => hay.includes(w))) continue
    let score = 0
    if (e.title.startsWith(q) || e.fullTitle.startsWith(q)) score += 100
    else if (e.fullTitle.includes(q)) score += 60
    if (e.artist.startsWith(q)) score += 40
    for (const w of words) {
      if (startsWord(e.fullTitle, w)) score += 10
      else if (startsWord(e.artist, w)) score += 6
      else score += 1
    }
    scored.push({ song: e.song, score })
  }
  scored.sort((a, b) => b.score - a.score || a.song.title.localeCompare(b.song.title))
  return scored.slice(0, limit).map((s) => s.song)
}

/** Built-in matches first, then extra online ones. Online artwork upgrades a built-in match. */
export function mergeResults(local: Song[], remote: Song[], limit = 10): Song[] {
  const remoteByKey = new Map(remote.map((s) => [s.key, s]))
  const out: Song[] = local.map((s) => remoteByKey.get(s.key) ?? s)
  const seen = new Set(out.map((s) => s.key))
  for (const s of remote) {
    if (!seen.has(s.key)) {
      out.push(s)
      seen.add(s.key)
    }
  }
  return out.slice(0, limit)
}
