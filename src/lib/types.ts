export type SongSource = 'itunes' | 'manual'

/** A song as chosen by a guest. `key` is the normalized identity used to match hits. */
export interface Song {
  key: string
  title: string
  artist: string
  artworkUrl?: string
  source: SongSource
}

/** One guest's entry. `id` is the guest's (anonymous) auth uid. */
export interface Pick {
  id: string
  name: string
  songs: Song[]
  createdAt: number
  updatedAt: number
}

/** A song the admin marked as played. Times are epoch milliseconds. */
export interface Hit {
  at: number
  title: string
  artist: string
}

export interface GameState {
  locked: boolean
  hits: Record<string, Hit>
  resetAt?: number
}

export const EMPTY_STATE: GameState = { locked: false, hits: {} }

export const SONGS_PER_PICK = 3
export const MAX_NAME_LENGTH = 40

export interface PlayerStanding {
  pick: Pick
  /** Keys of this player's songs that have been played (deduped). */
  hitKeys: string[]
  hitCount: number
  /** When the player's last song was played, or null if not all have played. */
  completedAt: number | null
}

export interface Standings {
  /** Sorted: completed first (earliest first), then by hit count desc, then name. */
  players: PlayerStanding[]
  /** Everyone who completed at the earliest completion time (ties => co-winners). */
  winners: PlayerStanding[]
}

/** A song aggregated across all picks, for the admin "Songs" tab. */
export interface SongTally {
  song: Song
  pickedBy: string[]
  hit: Hit | null
}
