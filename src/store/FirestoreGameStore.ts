import { getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import {
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth'
import {
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  deleteField,
  doc,
  FieldPath,
  getDoc,
  getDocs,
  initializeFirestore,
  memoryLocalCache,
  onSnapshot,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore'
import { EMULATOR_PROJECT_ID, firebaseConfig, useFirebaseEmulators } from '../firebaseConfig'
import { EMPTY_STATE, type GameState, type Hit, type Pick, type Song } from '../lib/types'
import { validatePick } from '../lib/validate'
import { StoreError, validatePin, type GameStore, type PickInput, type StoreUser, type Unsubscribe } from './GameStore'

/**
 * The admin PIN is the password of one hidden email/password account. Guests
 * are anonymous users. Who may write what is enforced by firestore.rules.
 */
const ADMIN_EMAIL = 'admin@weddingsongbingo.app'
const pinToPassword = (pin: string) => `wsb-${pin}`
const DB_TIMEOUT_MS = 10_000

/** Reject if a database call takes too long, so the UI never waits forever. */
function withTimeout<T>(p: Promise<T>, ms = DB_TIMEOUT_MS): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new StoreError('Can’t reach the database. Check your connection and reload.', 'unknown')),
      ms,
    )
    p.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (e: unknown) => {
        clearTimeout(t)
        reject(e)
      },
    )
  })
}

let firebase: { app: FirebaseApp; auth: Auth; db: Firestore } | null = null

/** Initialize Firebase once per page (React StrictMode constructs the store twice in dev). */
function getFirebase() {
  if (firebase) return firebase
  const existing = getApps()[0]
  const app =
    existing ??
    initializeApp(
      useFirebaseEmulators
        ? { apiKey: 'demo-api-key', authDomain: '127.0.0.1', projectId: EMULATOR_PROJECT_ID }
        : firebaseConfig,
    )
  const auth = getAuth(app)
  // In-memory cache: the IndexedDB-backed multi-tab cache can stall inside
  // iPhone in-app browsers. Long polling is auto-detected for networks and
  // browsers that break streaming connections.
  const db = initializeFirestore(app, {
    localCache: memoryLocalCache(),
    experimentalAutoDetectLongPolling: true,
  })
  if (useFirebaseEmulators) {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
  firebase = { app, auth, db }
  return firebase
}

export class FirestoreGameStore implements GameStore {
  readonly mode = 'firebase' as const
  private auth: Auth
  private db: Firestore
  private user: StoreUser | null = null
  private userListeners = new Set<(u: StoreUser | null) => void>()
  private lastState: GameState = EMPTY_STATE

  constructor() {
    const { auth, db } = getFirebase()
    this.auth = auth
    this.db = db
    onAuthStateChanged(this.auth, (fbUser) => {
      if (!fbUser) {
        signInAnonymously(this.auth).catch((e: unknown) => console.error('Anonymous sign-in failed', e))
        this.setUser(null)
        return
      }
      void this.resolveUser(fbUser)
    })
  }

  private resolveSeq = 0

  /** Work out whether this signed-in user is the admin. Only the latest call wins. */
  private async resolveUser(fbUser: User): Promise<void> {
    const seq = ++this.resolveSeq
    let isAdmin = false
    if (!fbUser.isAnonymous) {
      try {
        const snap = await withTimeout(getDoc(doc(this.db, 'config', 'admin')))
        isAdmin = snap.exists() && snap.data().uid === fbUser.uid
      } catch (e) {
        console.warn('Admin check failed', e)
        isAdmin = false
      }
    }
    if (seq !== this.resolveSeq) return // a newer check is in charge
    if (this.auth.currentUser?.uid !== fbUser.uid) return // signed-in user changed while we looked
    this.setUser({ uid: fbUser.uid, isAdmin })
  }

  private setUser(user: StoreUser | null): void {
    this.user = user
    for (const cb of this.userListeners) cb(user)
  }

  subscribeUser(cb: (user: StoreUser | null) => void): Unsubscribe {
    this.userListeners.add(cb)
    cb(this.user)
    return () => this.userListeners.delete(cb)
  }

  subscribeState(cb: (state: GameState) => void, onError?: (err: Error) => void): Unsubscribe {
    return this.whenSignedIn(() =>
      onSnapshot(
        doc(this.db, 'game', 'state'),
        (snap) => {
          const data = snap.exists() ? snap.data({ serverTimestamps: 'estimate' }) : null
          this.lastState = toState(data)
          cb(this.lastState)
        },
        (e) => onError?.(friendly(e)),
      ),
    )
  }

  /**
   * Guests may only read their own entry until the admin locks picks; then
   * everyone's are revealed. The admin always sees all. firestore.rules enforces
   * this, so the listener switches between "my doc" and "whole collection".
   */
  subscribePicks(cb: (picks: Pick[]) => void, onError?: (err: Error) => void): Unsubscribe {
    let user: StoreUser | null = null
    let locked = false
    let current = ''
    let inner: Unsubscribe | null = null

    const stop = () => {
      inner?.()
      inner = null
      current = ''
    }
    const restart = () => {
      if (!user) return stop()
      const all = user.isAdmin || locked
      const key = `${user.uid}:${all ? 'all' : 'own'}`
      if (key === current) return
      stop()
      current = key
      if (all) {
        inner = onSnapshot(
          collection(this.db, 'picks'),
          (snap) => cb(snap.docs.map((d) => toPick(d.id, d.data({ serverTimestamps: 'estimate' })))),
          (e) => {
            // Unlocking revokes access to others' picks; fall back to our own.
            if (authCode(e) === 'permission-denied' && !user?.isAdmin) {
              locked = false
              restart()
            } else onError?.(friendly(e))
          },
        )
      } else {
        const uid = user.uid
        inner = onSnapshot(
          doc(this.db, 'picks', uid),
          (snap) => cb(snap.exists() ? [toPick(uid, snap.data({ serverTimestamps: 'estimate' }))] : []),
          (e) => onError?.(friendly(e)),
        )
      }
    }

    const offUser = this.subscribeUser((u) => {
      user = u
      restart()
    })
    const offState = this.subscribeState((s) => {
      locked = s.locked
      restart()
    })
    return () => {
      offUser()
      offState()
      stop()
    }
  }

  /** Firestore rules require a signed-in user, so defer listeners until anonymous auth completes. */
  private whenSignedIn(start: () => Unsubscribe): Unsubscribe {
    let inner: Unsubscribe | null = null
    let stopped = false
    const off = this.subscribeUser((u) => {
      if (u && !inner && !stopped) {
        inner = start()
        off()
      }
    })
    return () => {
      stopped = true
      off()
      inner?.()
    }
  }

  // ---- guest writes ----

  async savePick(input: PickInput): Promise<void> {
    const uid = this.requireUser().uid
    if (this.lastState.locked) throw new StoreError('Picks are locked.', 'locked')
    const error = validatePick(input.name, input.songs)
    if (error) throw new StoreError(error, 'invalid')
    const ref = doc(this.db, 'picks', uid)
    try {
      const existing = await getDoc(ref)
      await setDoc(
        ref,
        {
          name: input.name.trim(),
          songs: input.songs.map(cleanSong),
          createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
      )
    } catch (e) {
      throw friendly(e, this.lastState.locked ? 'locked' : 'permission')
    }
  }

  async deletePick(id: string): Promise<void> {
    this.requireUser()
    try {
      await deleteDoc(doc(this.db, 'picks', id))
    } catch (e) {
      throw friendly(e)
    }
  }

  // ---- admin writes ----

  async markHit(song: Song): Promise<void> {
    this.requireAdmin()
    try {
      await setDoc(
        doc(this.db, 'game', 'state'),
        { hits: { [song.key]: { at: serverTimestamp(), title: song.title, artist: song.artist } } },
        { merge: true },
      )
    } catch (e) {
      throw friendly(e)
    }
  }

  async unmarkHit(key: string): Promise<void> {
    this.requireAdmin()
    try {
      await updateDoc(doc(this.db, 'game', 'state'), new FieldPath('hits', key), deleteField())
    } catch (e) {
      throw friendly(e)
    }
  }

  async setLocked(locked: boolean): Promise<void> {
    this.requireAdmin()
    try {
      await setDoc(doc(this.db, 'game', 'state'), { locked }, { merge: true })
    } catch (e) {
      throw friendly(e)
    }
  }

  async resetGame(): Promise<void> {
    this.requireAdmin()
    try {
      const picks = await getDocs(collection(this.db, 'picks'))
      const batch = writeBatch(this.db)
      batch.set(doc(this.db, 'game', 'state'), { locked: false, hits: {}, resetAt: serverTimestamp() })
      for (const d of picks.docs) batch.delete(d.ref)
      await batch.commit()
    } catch (e) {
      throw friendly(e)
    }
  }

  // ---- admin auth ----

  async hasAdmin(): Promise<boolean> {
    try {
      return (await withTimeout(getDoc(doc(this.db, 'config', 'admin')))).exists()
    } catch (e) {
      throw friendly(e)
    }
  }

  async adminSetup(pin: string): Promise<void> {
    const err = validatePin(pin)
    if (err) throw new StoreError(err, 'invalid')
    if (await this.hasAdmin()) throw new StoreError('An admin PIN is already set.', 'admin-exists')
    let cred
    try {
      cred = await createUserWithEmailAndPassword(this.auth, ADMIN_EMAIL, pinToPassword(pin))
    } catch (e) {
      if (authCode(e) === 'auth/email-already-in-use') {
        throw new StoreError('An admin PIN is already set. Enter it instead.', 'admin-exists')
      }
      throw friendly(e)
    }
    try {
      await setDoc(doc(this.db, 'config', 'admin'), { uid: cred.user.uid })
    } catch (e) {
      await signOut(this.auth)
      throw friendly(e, 'admin-exists')
    }
    await this.resolveUser(cred.user)
  }

  async adminLogin(pin: string): Promise<void> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, ADMIN_EMAIL, pinToPassword(pin))
      await this.resolveUser(cred.user)
      if (!this.user?.isAdmin) {
        await signOut(this.auth)
        throw new StoreError('This account is not the admin.', 'permission')
      }
    } catch (e) {
      const code = authCode(e)
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential' || code === 'auth/invalid-login-credentials') {
        throw new StoreError('Wrong PIN.', 'wrong-pin')
      }
      if (code === 'auth/too-many-requests') {
        throw new StoreError('Too many attempts. Wait a few minutes and try again.', 'wrong-pin')
      }
      throw friendly(e)
    }
  }

  async adminLogout(): Promise<void> {
    await signOut(this.auth) // onAuthStateChanged signs back in anonymously
  }

  // ---- helpers ----

  private requireUser(): StoreUser {
    if (!this.user) throw new StoreError('Still connecting. Try again in a moment.', 'unknown')
    return this.user
  }

  private requireAdmin(): void {
    if (!this.requireUser().isAdmin) throw new StoreError('Admin only.', 'permission')
  }
}

function cleanSong(s: Song): Song {
  const out: Song = { key: s.key, title: s.title, artist: s.artist, source: s.source }
  if (s.artworkUrl) out.artworkUrl = s.artworkUrl
  return out
}

function toMillis(v: unknown): number {
  if (v instanceof Timestamp) return v.toMillis()
  if (typeof v === 'number') return v
  return Date.now()
}

function toState(data: DocumentData | null): GameState {
  if (!data) return { locked: false, hits: {} }
  const hits: Record<string, Hit> = {}
  const raw = (data.hits ?? {}) as Record<string, { at?: unknown; title?: string; artist?: string }>
  for (const [key, h] of Object.entries(raw)) {
    hits[key] = { at: toMillis(h?.at), title: String(h?.title ?? ''), artist: String(h?.artist ?? '') }
  }
  return { locked: data.locked === true, hits, resetAt: data.resetAt ? toMillis(data.resetAt) : undefined }
}

function toPick(id: string, data: DocumentData): Pick {
  return {
    id,
    name: String(data.name ?? ''),
    songs: Array.isArray(data.songs) ? (data.songs as Song[]) : [],
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  }
}

function authCode(e: unknown): string {
  return typeof e === 'object' && e !== null && 'code' in e ? String((e as { code: unknown }).code) : ''
}

function friendly(e: unknown, denied: StoreError['code'] = 'permission'): StoreError {
  if (e instanceof StoreError) return e
  const code = authCode(e)
  if (code === 'permission-denied') {
    return new StoreError(
      denied === 'locked' ? 'Picks are locked.' : 'You don’t have permission to do that.',
      denied,
    )
  }
  if (code === 'unavailable') return new StoreError('No connection. Check your signal and try again.', 'unknown')
  return new StoreError(e instanceof Error ? e.message : 'Something went wrong.', 'unknown')
}
