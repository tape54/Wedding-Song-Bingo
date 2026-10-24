/**
 * Song identity normalization.
 *
 * Two guests may pick different editions of the same song (single vs. album,
 * remaster, explicit) that iTunes returns as separate tracks. We collapse them
 * to one key so the admin marks a song once and everyone who picked it is hit.
 */

const FEAT_RE = /\s+(?:feat\.?|ft\.?|featuring)\s+.*$/i
const SPLIT_ARTIST_RE = /\s+(?:feat\.?|ft\.?|featuring|x)\s+/i
const BRACKETS_RE = /\s*[([{][^)\]}]*[)\]}]/g
const QUALIFIER_SUFFIX_RE =
  /\s+-\s+(?:.*\b(?:remaster(?:ed)?|remix|mix|edit|version|live|mono|stereo|deluxe|bonus|acoustic|single|album|explicit|clean|demo|instrumental|anniversary|from|soundtrack|original|radio|extended|\d{4})\b.*)$/i

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Lowercase, strip accents and punctuation, collapse spaces. */
export function squash(s: string): string {
  return stripDiacritics(s)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[’`]/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/'/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeTitle(title: string): string {
  let t = title
  t = t.replace(BRACKETS_RE, ' ')
  t = t.replace(QUALIFIER_SUFFIX_RE, '')
  t = t.replace(FEAT_RE, '')
  return squash(t)
}

export function primaryArtist(artist: string): string {
  const first = artist.split(SPLIT_ARTIST_RE)[0] ?? artist
  return squash(first.replace(BRACKETS_RE, ' '))
}

export function songKey(title: string, artist: string): string {
  return `${normalizeTitle(title)}|${primaryArtist(artist)}`
}
