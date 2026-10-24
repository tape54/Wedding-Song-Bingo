import type { GameStore } from './GameStore'

// Placeholder until the Firestore implementation lands; keeps the dynamic import resolvable.
function notReady(): never {
  throw new Error('FirestoreGameStore is not implemented yet')
}

export class FirestoreGameStore implements GameStore {
  readonly mode = 'firebase' as const
  subscribeUser = notReady
  subscribeState = notReady
  subscribePicks = notReady
  savePick = notReady
  deletePick = notReady
  markHit = notReady
  unmarkHit = notReady
  setLocked = notReady
  resetGame = notReady
  hasAdmin = notReady
  adminSetup = notReady
  adminLogin = notReady
  adminLogout = notReady
}
