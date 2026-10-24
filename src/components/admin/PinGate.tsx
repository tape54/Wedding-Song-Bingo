import { useEffect, useState, type FormEvent } from 'react'
import { clearAdminSession, recordAdminLogin } from '../../lib/adminSession'
import { StoreError, validatePin } from '../../store'
import { useStore } from '../../store/hooks'

export function PinGate() {
  const store = useStore()
  const [hasAdmin, setHasAdmin] = useState<boolean | null>(null)
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let cancelled = false
    store.hasAdmin().then(
      (v) => !cancelled && setHasAdmin(v),
      (e: unknown) => !cancelled && setError(e instanceof Error ? e.message : 'Could not reach the database.'),
    )
    return () => {
      cancelled = true
    }
  }, [store])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const problem = validatePin(pin)
    if (problem) {
      setError(problem)
      return
    }
    if (hasAdmin === false && pin !== confirm) {
      setError('The two PINs don’t match.')
      return
    }
    setBusy(true)
    // Record first: the admin page signs out any admin whose 24h session isn't fresh.
    recordAdminLogin()
    try {
      if (hasAdmin) await store.adminLogin(pin)
      else await store.adminSetup(pin)
    } catch (err) {
      clearAdminSession()
      setError(err instanceof StoreError ? err.message : 'Something went wrong. Try again.')
    } finally {
      setBusy(false)
    }
  }

  if (hasAdmin === null && !error) return <p className="muted center">Checking…</p>
  if (hasAdmin === null) {
    return (
      <section className="card">
        <h2 className="card-title">Can’t reach the game</h2>
        <div className="error" role="alert">
          {error}
        </div>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload
        </button>
      </section>
    )
  }

  return (
    <form className="card" onSubmit={submit}>
      <h2 className="card-title">{hasAdmin ? 'Admin PIN' : 'Set up your admin PIN'}</h2>
      <p className="muted">
        {hasAdmin
          ? 'Enter the PIN to run the game. You’ll stay signed in for 24 hours.'
          : 'This is the first visit to the admin page. Choose a PIN (4–12 digits) you’ll use to run the game. It can’t be changed from the app, so write it down.'}
      </p>
      <input
        className="input pin-input"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete={hasAdmin ? 'current-password' : 'new-password'}
        type="password"
        placeholder="PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
        aria-label="PIN"
        autoFocus
      />
      {hasAdmin === false && (
        <input
          className="input pin-input"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="new-password"
          type="password"
          placeholder="Confirm PIN"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
          aria-label="Confirm PIN"
        />
      )}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <button type="submit" className="btn btn--primary btn--big" disabled={busy || !pin}>
        {busy ? 'One moment…' : hasAdmin ? 'Enter' : 'Save PIN and continue'}
      </button>
    </form>
  )
}
