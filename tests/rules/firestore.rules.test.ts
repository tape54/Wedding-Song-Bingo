/**
 * Firestore security-rule tests. Run with `npm run test:rules`, which starts the
 * Firestore emulator (needs Java) and executes this file against it.
 */
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

const GUEST = 'guest-1'
const OTHER = 'guest-2'
const ADMIN = 'admin-1'

const song = (n: number) => ({ key: `song ${n}|artist`, title: `Song ${n}`, artist: 'Artist', source: 'manual' })
const validPick = () => ({ name: 'Sam', songs: [song(1), song(2), song(3)], createdAt: new Date(), updatedAt: new Date() })

const guestCtx = (uid: string) => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'anonymous' } })
const passwordCtx = (uid: string) => env.authenticatedContext(uid, { firebase: { sign_in_provider: 'password' } })

async function seedAdmin() {
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'config', 'admin'), { uid: ADMIN }))
}
async function seedState(state: Record<string, unknown>) {
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'game', 'state'), state))
}
async function seedPick(uid: string) {
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'picks', uid), validPick()))
}

beforeAll(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':')
  env = await initializeTestEnvironment({
    projectId: 'demo-wedding-song-bingo',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host, port: Number(port) },
  })
})
afterAll(() => env.cleanup())
beforeEach(() => env.clearFirestore())

describe('picks', () => {
  it('a signed-in guest can create and update their own valid entry', async () => {
    const db = guestCtx(GUEST).firestore()
    await assertSucceeds(setDoc(doc(db, 'picks', GUEST), validPick()))
    await assertSucceeds(updateDoc(doc(db, 'picks', GUEST), { name: 'Samantha', updatedAt: new Date() }))
  })

  it('a guest cannot write someone else’s entry or read without signing in', async () => {
    await assertFails(setDoc(doc(guestCtx(OTHER).firestore(), 'picks', GUEST), validPick()))
    await seedPick(GUEST)
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'picks', GUEST)))
  })

  it('keeps picks secret until locked: guests read only their own, admin reads all', async () => {
    await seedAdmin()
    await seedPick(GUEST)
    await seedPick(OTHER)
    const guest = guestCtx(GUEST).firestore()
    await assertSucceeds(getDoc(doc(guest, 'picks', GUEST)))
    await assertFails(getDoc(doc(guest, 'picks', OTHER)))
    await assertFails(getDocs(collection(guest, 'picks')))
    await assertSucceeds(getDocs(collection(passwordCtx(ADMIN).firestore(), 'picks')))

    await seedState({ locked: true, hits: {} })
    await assertSucceeds(getDoc(doc(guest, 'picks', OTHER)))
    await assertSucceeds(getDocs(collection(guest, 'picks')))
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore(), 'picks')))
  })

  it('a guest can read their own entry before creating it (empty is fine)', async () => {
    await assertSucceeds(getDoc(doc(guestCtx(GUEST).firestore(), 'picks', GUEST)))
  })

  it('rejects malformed entries', async () => {
    const db = guestCtx(GUEST).firestore()
    const ref = doc(db, 'picks', GUEST)
    await assertFails(setDoc(ref, { ...validPick(), name: '' }))
    await assertFails(setDoc(ref, { ...validPick(), name: 'x'.repeat(41) }))
    await assertFails(setDoc(ref, { ...validPick(), songs: [song(1), song(2)] }))
    await assertFails(setDoc(ref, { ...validPick(), songs: [song(1), song(1), song(2)] }))
    await assertFails(setDoc(ref, { ...validPick(), songs: [song(1), song(2), { ...song(3), source: 'spotify' }] }))
    await assertFails(setDoc(ref, { ...validPick(), extra: true }))
  })

  it('cannot change createdAt on update', async () => {
    await seedPick(GUEST)
    await assertFails(updateDoc(doc(guestCtx(GUEST).firestore(), 'picks', GUEST), { createdAt: new Date(0) }))
  })

  it('locking blocks guest creates, updates and deletes but not admin deletes', async () => {
    await seedAdmin()
    await seedPick(GUEST)
    await seedState({ locked: true, hits: {} })
    const guest = guestCtx(GUEST).firestore()
    await assertFails(setDoc(doc(guest, 'picks', GUEST), validPick()))
    await assertFails(updateDoc(doc(guest, 'picks', GUEST), { name: 'Nope', updatedAt: new Date() }))
    await assertFails(deleteDoc(doc(guest, 'picks', GUEST)))
    await assertFails(setDoc(doc(guestCtx(OTHER).firestore(), 'picks', OTHER), validPick()))
    await assertSucceeds(deleteDoc(doc(passwordCtx(ADMIN).firestore(), 'picks', GUEST)))
  })

  it('a guest may delete their own entry while unlocked, but not others’', async () => {
    await seedPick(GUEST)
    await assertFails(deleteDoc(doc(guestCtx(OTHER).firestore(), 'picks', GUEST)))
    await assertSucceeds(deleteDoc(doc(guestCtx(GUEST).firestore(), 'picks', GUEST)))
  })
})

describe('game state', () => {
  it('only the admin can write; any signed-in user can read', async () => {
    await seedAdmin()
    await assertFails(setDoc(doc(guestCtx(GUEST).firestore(), 'game', 'state'), { locked: true }))
    await assertFails(setDoc(doc(passwordCtx('impostor').firestore(), 'game', 'state'), { locked: true }))
    await assertSucceeds(setDoc(doc(passwordCtx(ADMIN).firestore(), 'game', 'state'), { locked: true, hits: {} }))
    await assertSucceeds(
      setDoc(doc(passwordCtx(ADMIN).firestore(), 'game', 'state'), { hits: { 'song 1|artist': { at: new Date(), title: 'Song 1', artist: 'Artist' } } }, { merge: true }),
    )
    await assertSucceeds(getDoc(doc(guestCtx(GUEST).firestore(), 'game', 'state')))
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), 'game', 'state')))
  })
})

describe('config/admin', () => {
  it('can be claimed once by a password user for their own uid', async () => {
    await assertFails(setDoc(doc(guestCtx(GUEST).firestore(), 'config', 'admin'), { uid: GUEST }))
    await assertFails(setDoc(doc(passwordCtx(ADMIN).firestore(), 'config', 'admin'), { uid: OTHER }))
    await assertSucceeds(setDoc(doc(passwordCtx(ADMIN).firestore(), 'config', 'admin'), { uid: ADMIN }))
    await assertFails(setDoc(doc(passwordCtx('later').firestore(), 'config', 'admin'), { uid: 'later' }))
    await assertFails(updateDoc(doc(passwordCtx(ADMIN).firestore(), 'config', 'admin'), { uid: 'other' }))
    await assertFails(deleteDoc(doc(passwordCtx(ADMIN).firestore(), 'config', 'admin')))
    await assertSucceeds(getDoc(doc(guestCtx(GUEST).firestore(), 'config', 'admin')))
  })
})
