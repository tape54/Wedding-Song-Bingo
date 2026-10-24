/**
 * Paste your Firebase web app config here (Firebase console → Project settings →
 * Your apps → SDK setup and configuration → Config). These values are public by
 * design; access is controlled by firestore.rules, not by hiding them.
 *
 * Until this is filled in, the app runs in demo mode (data stays on this device).
 */
export const firebaseConfig = {
  apiKey: 'PASTE_YOUR_FIREBASE_CONFIG',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
}

/** Set VITE_FIREBASE_EMULATOR=1 to run against local Firebase emulators (see README). */
export const useFirebaseEmulators = import.meta.env.VITE_FIREBASE_EMULATOR === '1'
export const EMULATOR_PROJECT_ID = 'demo-wedding-song-bingo'

export function isFirebaseConfigured(): boolean {
  if (useFirebaseEmulators) return true
  return !firebaseConfig.apiKey.startsWith('PASTE') && firebaseConfig.projectId !== ''
}
