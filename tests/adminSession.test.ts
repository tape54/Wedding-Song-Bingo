import { beforeEach, describe, expect, it } from 'vitest'
import {
  ADMIN_SESSION_TTL_MS,
  clearAdminSession,
  isAdminSessionFresh,
  recordAdminLogin,
} from '../src/lib/adminSession'

describe('admin session', () => {
  beforeEach(() => localStorage.clear())

  it('is fresh for 24 hours after login, then expires', () => {
    expect(isAdminSessionFresh(1000)).toBe(false)
    recordAdminLogin(1000)
    expect(isAdminSessionFresh(1000 + ADMIN_SESSION_TTL_MS - 1)).toBe(true)
    expect(isAdminSessionFresh(1000 + ADMIN_SESSION_TTL_MS)).toBe(false)
  })

  it('can be cleared', () => {
    recordAdminLogin(5)
    clearAdminSession()
    expect(isAdminSessionFresh(6)).toBe(false)
  })
})
