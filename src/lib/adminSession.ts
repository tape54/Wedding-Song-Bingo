/** Remembers when the admin last entered the PIN so they stay signed in for 24 hours. */
const KEY = 'wsb.adminLoginAt'
export const ADMIN_SESSION_TTL_MS = 24 * 60 * 60 * 1000

export function recordAdminLogin(now = Date.now()): void {
  try {
    localStorage.setItem(KEY, String(now))
  } catch {
    /* storage unavailable: the session just won't persist */
  }
}

export function isAdminSessionFresh(now = Date.now()): boolean {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return false
    const at = Number(raw)
    return Number.isFinite(at) && now - at < ADMIN_SESSION_TTL_MS
  } catch {
    return false
  }
}

export function clearAdminSession(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
