import type { Hit, Pick, PlayerStanding, SongTally, Standings } from './types'

/** Compute everyone's progress and the winner(s) from the current hits. Pure. */
export function computeStandings(picks: Pick[], hits: Record<string, Hit>): Standings {
  const players: PlayerStanding[] = picks.map((pick) => {
    const keys = [...new Set(pick.songs.map((s) => s.key))]
    const hitKeys = keys.filter((k) => k in hits)
    const complete = keys.length > 0 && hitKeys.length === keys.length
    const completedAt = complete ? Math.max(...hitKeys.map((k) => hits[k].at)) : null
    return { pick, hitKeys, hitCount: hitKeys.length, completedAt }
  })

  players.sort((a, b) => {
    if (a.completedAt !== null || b.completedAt !== null) {
      if (a.completedAt === null) return 1
      if (b.completedAt === null) return -1
      if (a.completedAt !== b.completedAt) return a.completedAt - b.completedAt
    }
    if (a.hitCount !== b.hitCount) return b.hitCount - a.hitCount
    const byName = a.pick.name.localeCompare(b.pick.name, undefined, { sensitivity: 'base' })
    if (byName !== 0) return byName
    return a.pick.createdAt - b.pick.createdAt
  })

  const first = players.find((p) => p.completedAt !== null)
  const winners = first ? players.filter((p) => p.completedAt === first.completedAt) : []
  return { players, winners }
}

/** Aggregate every picked song with who picked it and its hit status, for the admin. */
export function tallySongs(picks: Pick[], hits: Record<string, Hit>): SongTally[] {
  const byKey = new Map<string, SongTally>()
  for (const pick of picks) {
    for (const song of pick.songs) {
      let tally = byKey.get(song.key)
      if (!tally) {
        tally = { song: { ...song }, pickedBy: [], hit: hits[song.key] ?? null }
        byKey.set(song.key, tally)
      } else if (!tally.song.artworkUrl && song.artworkUrl) {
        tally.song = { ...song }
      }
      if (!tally.pickedBy.includes(pick.name)) tally.pickedBy.push(pick.name)
    }
  }
  return [...byKey.values()].sort((a, b) => {
    if (b.pickedBy.length !== a.pickedBy.length) return b.pickedBy.length - a.pickedBy.length
    return a.song.title.localeCompare(b.song.title, undefined, { sensitivity: 'base' })
  })
}
