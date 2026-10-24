import { MAX_NAME_LENGTH, SONGS_PER_PICK, type Song } from './types'

/** Returns an error message, or null when the entry is valid. Mirrors firestore.rules. */
export function validatePick(name: string, songs: Song[]): string | null {
  const trimmed = name.trim()
  if (trimmed.length === 0) return 'Please enter your name.'
  if (trimmed.length > MAX_NAME_LENGTH) return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`
  if (songs.length !== SONGS_PER_PICK) return `Pick exactly ${SONGS_PER_PICK} songs.`
  if (songs.some((s) => !s.title.trim() || !s.artist.trim() || !s.key)) {
    return 'Every song needs a title and an artist.'
  }
  if (new Set(songs.map((s) => s.key)).size !== songs.length) {
    return 'You picked the same song twice. Choose 3 different songs.'
  }
  return null
}
