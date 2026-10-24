import { describe, expect, it, vi } from 'vitest'
import { backupEnabled, picksToCsv, sendBackup, toBackupEntry } from '../src/lib/backup'
import { manualSong } from '../src/lib/songSearch'
import type { Pick } from '../src/lib/types'

const pick = (id: string, name: string, at: number): Pick => ({
  id,
  name,
  songs: [manualSong('Dancing Queen', 'ABBA'), manualSong('September', 'Earth, Wind & Fire'), manualSong('Hey Ya!', 'OutKast')],
  createdAt: at,
  updatedAt: at,
})

describe('backup', () => {
  it('is off without a URL', async () => {
    expect(backupEnabled('')).toBe(false)
    const fetchFn = vi.fn()
    await sendBackup([toBackupEntry(pick('u1', 'Sam', 1))], '', fetchFn as unknown as typeof fetch)
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('posts entries as a simple no-cors request', async () => {
    const fetchFn = vi.fn(async (_url: string, _init?: RequestInit) => new Response(null))
    const url = 'https://script.google.com/macros/s/abc/exec'
    await sendBackup([toBackupEntry(pick('u1', 'Sam', 1))], url, fetchFn as unknown as typeof fetch)
    expect(fetchFn).toHaveBeenCalledTimes(1)
    const [calledUrl, init] = fetchFn.mock.calls[0]
    expect(calledUrl).toBe(url)
    expect(init).toMatchObject({ method: 'POST', mode: 'no-cors', keepalive: true })
    const body = JSON.parse(String(init!.body))
    expect(body.picks[0]).toEqual({
      id: 'u1',
      name: 'Sam',
      songs: [
        { title: 'Dancing Queen', artist: 'ABBA' },
        { title: 'September', artist: 'Earth, Wind & Fire' },
        { title: 'Hey Ya!', artist: 'OutKast' },
      ],
    })
  })

  it('builds a CSV, oldest entry first, quoting commas and neutralizing formulas', () => {
    const csv = picksToCsv([pick('u2', '=Jo', 2), pick('u1', 'Sam', 1)])
    const lines = csv.trim().split('\r\n')
    expect(lines[0]).toBe('Name,Song 1,Artist 1,Song 2,Artist 2,Song 3,Artist 3,Last saved')
    expect(lines[1].startsWith('Sam,Dancing Queen,ABBA,September,"Earth, Wind & Fire",Hey Ya!,OutKast,')).toBe(true)
    expect(lines[2].startsWith("'=Jo,")).toBe(true)
  })
})
