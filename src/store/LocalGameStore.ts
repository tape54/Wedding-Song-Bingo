import { EMPTY_STATE, type GameState, type Pick, type Song } from '../lib/types'
import { validatePick } from '../lib/validate'
import { StoreError, validatePin, type GameStore, type PickInput, type StoreUser, type Unsubscribe } from './GameStore'

/**
 * Demo-mode store. Game data lives in localStorage (shared by every tab on this
 * device); identity lives in sessionStorage, so each tab acts as a different
 * guest. Other tabs are notified through the browser's `storage` event.
 */
const STATE_KEY = 'wsb.demo.state'
const PICKS_KEY = 'wsb.demo.picks'
const ADMIN_KEY = 'wsb.demo.adminPin'
const UID_KEY = 'wsb.demo.uid'
const IS_ADMIN_KEY = 'wsb.demo.isAdmin'

type Listener<T> = (value: T) => void

export class LocalGameStore implements GameStore {
  readonly mode = 'demo' as const
  private stateListeners = new Set<Listener<GameState>>()
  private pickListeners = new Set<Listener<Pick[]>>()
  private userListeners = new Set<Listener<StoreUser | null>>()
  private user: StoreUser

  constructor(
    private local: Storage = localStorage,
    private session: Storage = sessionStorage,
  ) {
    let uid = this.session.getItem(UID_KEY)
    if (!uid) {
      uid = 'demo-' + Math.random().toString(36).slice(2, 10)
      this.session.setItem(UID_KEY, uid)
    }
    this.user = { uid, isAdmin: this.session.getItem(IS_ADMIN_KEY) === '1' }
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STATE_KEY || e.key === null) this.emitState()
        if (e.key === PICKS_KEY || e.key === null) this.emitPicks()
      })
    }
  }

  // ---- reads ----

  private readState(): GameState {
    return read<GameState>(this.local, STATE_KEY) ?? { ...EMPTY_STATE, hits: {} }
  }

  private readPicks(): Pick[] {
    return read<Pick[]>(this.local, PICKS_KEY) ?? []
  }

  subscribeUser(cb: Listener<StoreUser | null>): Unsubscribe {
    this.userListeners.add(cb)
    cb(this.user)
    return () => this.userListeners.delete(cb)
  }

  subscribeState(cb: Listener<GameState>): Unsubscribe {
    this.stateListeners.add(cb)
    cb(this.readState())
    return () => this.stateListeners.delete(cb)
  }

  subscribePicks(cb: Listener<Pick[]>): Unsubscribe {
    this.pickListeners.add(cb)
    cb(this.readPicks())
    return () => this.pickListeners.delete(cb)
  }

  // ---- guest writes ----

  async savePick(input: PickInput): Promise<void> {
    if (this.readState().locked) throw new StoreError('Picks are locked.', 'locked')
    const error = validatePick(input.name, input.songs)
    if (error) throw new StoreError(error, 'invalid')
    const picks = this.readPicks()
    const now = Date.now()
    const existing = picks.find((p) => p.id === this.user.uid)
    const next: Pick = {
      id: this.user.uid,
      name: input.name.trim(),
      songs: input.songs,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    this.writePicks([...picks.filter((p) => p.id !== this.user.uid), next])
  }

  async deletePick(id: string): Promise<void> {
    const own = id === this.user.uid
    if (!own && !this.user.isAdmin) throw new StoreError('Not allowed.', 'permission')
    if (own && !this.user.isAdmin && this.readState().locked) {
      throw new StoreError('Picks are locked.', 'locked')
    }
    this.writePicks(this.readPicks().filter((p) => p.id !== id))
  }

  // ---- admin writes ----

  private requireAdmin(): void {
    if (!this.user.isAdmin) throw new StoreError('Admin only.', 'permission')
  }

  async markHit(song: Song): Promise<void> {
    this.requireAdmin()
    const state = this.readState()
    if (state.hits[song.key]) return
    state.hits[song.key] = { at: Date.now(), title: song.title, artist: song.artist }
    this.writeState(state)
  }

  async unmarkHit(key: string): Promise<void> {
    this.requireAdmin()
    const state = this.readState()
    delete state.hits[key]
    this.writeState(state)
  }

  async setLocked(locked: boolean): Promise<void> {
    this.requireAdmin()
    this.writeState({ ...this.readState(), locked })
  }

  async resetGame(): Promise<void> {
    this.requireAdmin()
    this.writeState({ locked: false, hits: {}, resetAt: Date.now() })
    this.writePicks([])
  }

  // ---- admin auth ----

  async hasAdmin(): Promise<boolean> {
    return this.local.getItem(ADMIN_KEY) !== null
  }

  async adminSetup(pin: string): Promise<void> {
    const err = validatePin(pin)
    if (err) throw new StoreError(err, 'invalid')
    if (await this.hasAdmin()) throw new StoreError('An admin PIN is already set.', 'admin-exists')
    this.local.setItem(ADMIN_KEY, pin)
    this.setAdmin(true)
  }

  async adminLogin(pin: string): Promise<void> {
    if (this.local.getItem(ADMIN_KEY) !== pin) throw new StoreError('Wrong PIN.', 'wrong-pin')
    this.setAdmin(true)
  }

  async adminLogout(): Promise<void> {
    this.setAdmin(false)
  }

  // ---- internals ----

  private setAdmin(isAdmin: boolean): void {
    this.session.setItem(IS_ADMIN_KEY, isAdmin ? '1' : '0')
    this.user = { ...this.user, isAdmin }
    for (const cb of this.userListeners) cb(this.user)
  }

  private writeState(state: GameState): void {
    this.local.setItem(STATE_KEY, JSON.stringify(state))
    this.emitState()
  }

  private writePicks(picks: Pick[]): void {
    this.local.setItem(PICKS_KEY, JSON.stringify(picks))
    this.emitPicks()
  }

  private emitState(): void {
    const state = this.readState()
    for (const cb of this.stateListeners) cb(state)
  }

  private emitPicks(): void {
    const picks = this.readPicks()
    for (const cb of this.pickListeners) cb(picks)
  }
}

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}
