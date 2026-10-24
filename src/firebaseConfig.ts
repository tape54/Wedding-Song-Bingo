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

export function isFirebaseConfigured(): boolean {
  return !firebaseConfig.apiKey.startsWith('PASTE') && firebaseConfig.projectId !== ''
}
