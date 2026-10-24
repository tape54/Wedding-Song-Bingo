import { isFirebaseConfigured } from '../firebaseConfig'
import type { GameStore } from './GameStore'
import { LocalGameStore } from './LocalGameStore'

export type { GameStore, PickInput, StoreUser } from './GameStore'
export { StoreError, validatePin } from './GameStore'

/** Demo mode is used when Firebase isn't configured, or when the URL has ?demo=1. */
export function isDemoMode(search = typeof location !== 'undefined' ? location.search : ''): boolean {
  if (new URLSearchParams(search).get('demo') === '1') return true
  return !isFirebaseConfigured()
}

let storePromise: Promise<GameStore> | null = null

/** One store per page; React StrictMode may ask twice. */
export function createStore(): Promise<GameStore> {
  storePromise ??= (async () => {
    if (isDemoMode()) return new LocalGameStore()
    const { FirestoreGameStore } = await import('./FirestoreGameStore')
    return new FirestoreGameStore()
  })()
  return storePromise
}
