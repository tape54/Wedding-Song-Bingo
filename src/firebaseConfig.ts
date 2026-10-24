/**
 * Paste your Firebase web app config here (Firebase console → Project settings →
 * Your apps → SDK setup and configuration → Config). These values are public by
 * design; access is controlled by firestore.rules, not by hiding them.
 *
 * If this still held the placeholder, the app would run in demo mode.
 */
export const firebaseConfig = {
  apiKey: 'AIzaSyC_OuC-NG3StlHQBlGMf0qI7QUlGxWZPKU',
  authDomain: 'wedding-song-bingo-73dd6.firebaseapp.com',
  projectId: 'wedding-song-bingo-73dd6',
  storageBucket: 'wedding-song-bingo-73dd6.firebasestorage.app',
  messagingSenderId: '828348056269',
  appId: '1:828348056269:web:eadcc6e49e330932761f84',
}

/** Set VITE_FIREBASE_EMULATOR=1 to run against local Firebase emulators (see README). */
export const useFirebaseEmulators = import.meta.env.VITE_FIREBASE_EMULATOR === '1'
export const EMULATOR_PROJECT_ID = 'demo-wedding-song-bingo'

export function isFirebaseConfigured(): boolean {
  if (useFirebaseEmulators) return true
  return !firebaseConfig.apiKey.startsWith('PASTE') && firebaseConfig.projectId !== ''
}
