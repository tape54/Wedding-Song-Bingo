import type { GameState, Pick, Song } from '../lib/types'

export type Unsubscribe = () => void

export interface StoreUser {
  uid: string
  isAdmin: boolean
}

export interface PickInput {
  name: string
  songs: Song[]
}

/**
 * Everything the UI needs from the backend. Implemented by FirestoreGameStore
 * (real, multi-device) and LocalGameStore (demo mode, one device).
 */
export interface GameStore {
  readonly mode: 'firebase' | 'demo'

  /** Current identity; null until anonymous sign-in completes. */
  subscribeUser(cb: (user: StoreUser | null) => void): Unsubscribe
  subscribeState(cb: (state: GameState) => void, onError?: (err: Error) => void): Unsubscribe
  subscribePicks(cb: (picks: Pick[]) => void, onError?: (err: Error) => void): Unsubscribe

  /** Create or update the current user's entry. Rejected when locked. */
  savePick(input: PickInput): Promise<void>
  /** Owner (while unlocked) or admin. */
  deletePick(id: string): Promise<void>

  // Admin only
  markHit(song: Song): Promise<void>
  unmarkHit(key: string): Promise<void>
  setLocked(locked: boolean): Promise<void>
  /** Clears hits and all picks, and unlocks. */
  resetGame(): Promise<void>

  hasAdmin(): Promise<boolean>
  adminSetup(pin: string): Promise<void>
  adminLogin(pin: string): Promise<void>
  adminLogout(): Promise<void>
}

export class StoreError extends Error {
  constructor(
    message: string,
    readonly code: 'locked' | 'permission' | 'invalid' | 'wrong-pin' | 'admin-exists' | 'unknown',
  ) {
    super(message)
    this.name = 'StoreError'
  }
}

export const MIN_PIN_LENGTH = 4
export const MAX_PIN_LENGTH = 12

export function validatePin(pin: string): string | null {
  if (!/^\d+$/.test(pin)) return 'PIN must be digits only.'
  if (pin.length < MIN_PIN_LENGTH || pin.length > MAX_PIN_LENGTH) {
    return `PIN must be ${MIN_PIN_LENGTH}-${MAX_PIN_LENGTH} digits.`
  }
  return null
}
