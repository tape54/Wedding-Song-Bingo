import { BACKUP_URL } from '../backupConfig'
import type { Pick } from './types'

export interface BackupEntry {
  id: string
  name: string
  songs: { title: string; artist: string }[]
}

export function toBackupEntry(p: Pick): BackupEntry {
  return { id: p.id, name: p.name, songs: p.songs.map((s) => ({ title: s.title, artist: s.artist })) }
}

export function backupEnabled(url = BACKUP_URL): boolean {
  return url.trim() !== ''
}

/**
 * Send picks to the Google Sheet backup. Fire-and-forget: Apps Script doesn't
 * send CORS headers, so the response can't be read, and a failure here must
 * never block a guest from saving.
 */
export async function sendBackup(entries: BackupEntry[], url = BACKUP_URL, fetchFn: typeof fetch = fetch): Promise<void> {
  if (!backupEnabled(url) || entries.length === 0) return
  await fetchFn(url, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ picks: entries }),
  })
}

function csvCell(v: string): string {
  // Keep spreadsheet apps from treating names as formulas.
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export function picksToCsv(picks: Pick[]): string {
  const header = ['Name', 'Song 1', 'Artist 1', 'Song 2', 'Artist 2', 'Song 3', 'Artist 3', 'Last saved']
  const rows = [...picks]
    .sort((a, b) => a.createdAt - b.createdAt)
    .map((p) => [
      p.name,
      ...[0, 1, 2].flatMap((i) => [p.songs[i]?.title ?? '', p.songs[i]?.artist ?? '']),
      new Date(p.updatedAt).toLocaleString(),
    ])
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n'
}

/** Save a CSV file on the viewer's device. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}
