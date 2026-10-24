import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { guestUrl } from '../../hooks/useHashRoute'
import { clearAdminSession } from '../../lib/adminSession'
import type { GameState, Standings } from '../../lib/types'
import { useStore } from '../../store/hooks'

interface Props {
  state: GameState
  standings: Standings
  onError: (msg: string | null) => void
}

export function ControlsTab({ state, standings, onError }: Props) {
  const store = useStore()
  const [copied, setCopied] = useState(false)
  const url = guestUrl()

  const run = async (fn: () => Promise<void>) => {
    onError(null)
    try {
      await fn()
    } catch (e) {
      onError(e instanceof Error ? e.message : 'That didn’t work. Try again.')
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link', url)
    }
  }

  const reset = () => {
    if (!window.confirm('Reset the whole game? This deletes every guest’s picks and all played songs. This cannot be undone.')) return
    if (!window.confirm('Really reset? Last chance.')) return
    void run(() => store.resetGame())
  }

  return (
    <>
      <section className="card">
        <h2 className="card-title">Dance floor</h2>
        {standings.winners.length > 0 && (
          <div className="banner banner--locked">
            🏆 Winner{standings.winners.length > 1 ? 's' : ''}: <strong>{standings.winners.map((w) => w.pick.name).join(', ')}</strong>
          </div>
        )}
        <p className="muted small">
          {state.locked
            ? 'Picks are locked. Guests can’t add or change songs. Mark songs on the Songs tab as they play.'
            : 'Picks are open. Lock them when the dance floor starts so nobody changes their songs mid-game.'}
        </p>
        <button
          type="button"
          className={`btn btn--big ${state.locked ? '' : 'btn--primary'}`}
          onClick={() => run(() => store.setLocked(!state.locked))}
        >
          {state.locked ? '🔓 Unlock picks' : '🔒 Lock picks — dance floor is open'}
        </button>
      </section>

      <section className="card">
        <h2 className="card-title">Invite guests</h2>
        <p className="muted small">Share this link or let people scan the code.</p>
        <div className="qr">
          <QRCodeSVG value={url} size={180} />
        </div>
        <div className="share-url">{url}</div>
        <button type="button" className="btn" onClick={copy}>
          {copied ? 'Copied!' : 'Copy link'}
        </button>
      </section>

      <section className="card">
        <h2 className="card-title">Danger zone</h2>
        <button type="button" className="btn btn--danger" onClick={reset}>
          Reset game (delete all picks)
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() =>
            run(async () => {
              clearAdminSession()
              await store.adminLogout()
            })
          }
        >
          Sign out of admin
        </button>
      </section>
    </>
  )
}
