import { beforeEach, describe, expect, it, vi } from 'vitest'
import { manualSong } from '../src/lib/songSearch'
import type { GameState, Pick } from '../src/lib/types'
import { LocalGameStore } from '../src/store/LocalGameStore'

const songs = [manualSong('A', 'X'), manualSong('B', 'X'), manualSong('C', 'X')]

function latest<T>(fn: ReturnType<typeof vi.fn>): T {
  return fn.mock.calls[fn.mock.calls.length - 1][0] as T
}

describe('LocalGameStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  it('gives each session a stable anonymous uid', () => {
    const a = new LocalGameStore()
    const b = new LocalGameStore()
    const seen: string[] = []
    a.subscribeUser((u) => seen.push(u!.uid))
    b.subscribeUser((u) => seen.push(u!.uid))
    expect(seen[0]).toBe(seen[1])
    expect(seen[0]).toMatch(/^demo-/)
  })

  it('saves, updates and lists picks and notifies subscribers', async () => {
    const store = new LocalGameStore()
    const cb = vi.fn()
    store.subscribePicks(cb)
    expect(latest<Pick[]>(cb)).toEqual([])

    await store.savePick({ name: ' Sam ', songs })
    let picks = latest<Pick[]>(cb)
    expect(picks).toHaveLength(1)
    expect(picks[0].name).toBe('Sam')
    expect(picks[0].songs).toHaveLength(3)

    await store.savePick({ name: 'Samantha', songs })
    picks = latest<Pick[]>(cb)
    expect(picks).toHaveLength(1)
    expect(picks[0].name).toBe('Samantha')
    expect(picks[0].createdAt).toBeLessThanOrEqual(picks[0].updatedAt)
  })

  it('rejects invalid picks', async () => {
    const store = new LocalGameStore()
    await expect(store.savePick({ name: '', songs })).rejects.toMatchObject({ code: 'invalid' })
    await expect(store.savePick({ name: 'Sam', songs: songs.slice(1) })).rejects.toMatchObject({
      code: 'invalid',
    })
  })

  it('refuses guest writes to admin state', async () => {
    const store = new LocalGameStore()
    await expect(store.markHit(songs[0])).rejects.toMatchObject({ code: 'permission' })
    await expect(store.setLocked(true)).rejects.toMatchObject({ code: 'permission' })
    await expect(store.resetGame()).rejects.toMatchObject({ code: 'permission' })
  })

  it('admin can set a PIN once, log in, mark hits, lock and reset', async () => {
    const guest = new LocalGameStore()
    await guest.savePick({ name: 'Sam', songs })

    sessionStorage.clear() // new tab => new identity
    const admin = new LocalGameStore()
    expect(await admin.hasAdmin()).toBe(false)
    await expect(admin.adminSetup('12')).rejects.toMatchObject({ code: 'invalid' })
    await admin.adminSetup('123456')
    expect(await admin.hasAdmin()).toBe(true)
    await expect(admin.adminSetup('654321')).rejects.toMatchObject({ code: 'admin-exists' })

    const stateCb = vi.fn()
    admin.subscribeState(stateCb)

    await admin.markHit(songs[0])
    expect(Object.keys(latest<GameState>(stateCb).hits)).toEqual([songs[0].key])
    await admin.markHit(songs[0]) // idempotent
    expect(Object.keys(latest<GameState>(stateCb).hits)).toHaveLength(1)
    await admin.unmarkHit(songs[0].key)
    expect(latest<GameState>(stateCb).hits).toEqual({})

    await admin.setLocked(true)
    expect(latest<GameState>(stateCb).locked).toBe(true)
    await expect(guest.savePick({ name: 'Sam', songs })).rejects.toMatchObject({ code: 'locked' })
    await expect(guest.deletePick(guest['user'].uid)).rejects.toMatchObject({ code: 'locked' })

    await admin.resetGame()
    const after = latest<GameState>(stateCb)
    expect(after.locked).toBe(false)
    expect(after.hits).toEqual({})
    const picksCb = vi.fn()
    admin.subscribePicks(picksCb)
    expect(latest<Pick[]>(picksCb)).toEqual([])

    await admin.adminLogout()
    await expect(admin.setLocked(true)).rejects.toMatchObject({ code: 'permission' })
    await expect(admin.adminLogin('000000')).rejects.toMatchObject({ code: 'wrong-pin' })
    await admin.adminLogin('123456')
    await admin.setLocked(true)
  })

  it('admin can delete any pick, owner only their own', async () => {
    const guest = new LocalGameStore()
    await guest.savePick({ name: 'Sam', songs })
    const guestUid = guest['user'].uid

    sessionStorage.clear()
    const other = new LocalGameStore()
    await expect(other.deletePick(guestUid)).rejects.toMatchObject({ code: 'permission' })

    await other.adminSetup('1234')
    await other.deletePick(guestUid)
    const cb = vi.fn()
    other.subscribePicks(cb)
    expect(latest<Pick[]>(cb)).toEqual([])
  })
})
