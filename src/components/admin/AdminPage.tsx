import { useEffect, useMemo, useState } from 'react'
import { isAdminSessionFresh } from '../../lib/adminSession'
import { computeStandings } from '../../lib/standings'
import { useGameState, usePicks, useStore, useUser } from '../../store/hooks'
import { WinnerOverlay } from '../shared/WinnerOverlay'
import { ControlsTab } from './ControlsTab'
import { PinGate } from './PinGate'
import { PlayersTab } from './PlayersTab'
import { SongsTab } from './SongsTab'

type Tab = 'songs' | 'players' | 'controls'
const TABS: { id: Tab; label: string }[] = [
  { id: 'songs', label: 'Songs' },
  { id: 'players', label: 'Players' },
  { id: 'controls', label: 'Controls' },
]

export function AdminPage() {
  const store = useStore()
  const user = useUser()
  const { state, error: stateError } = useGameState()
  const { picks, error: picksError } = usePicks()
  const [tab, setTab] = useState<Tab>('songs')
  const [actionError, setActionError] = useState<string | null>(null)

  // The admin PIN keeps you signed in for 24 hours, then asks again.
  useEffect(() => {
    if (user?.isAdmin && !isAdminSessionFresh()) void store.adminLogout()
  }, [store, user])

  const standings = useMemo(() => computeStandings(picks, state.hits), [picks, state.hits])

  if (!user) return <p className="muted center">Connecting…</p>
  if (!user.isAdmin) return <PinGate />

  const error = actionError ?? stateError ?? picksError
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Admin sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" className="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {tab === 'songs' && <SongsTab picks={picks} hits={state.hits} onError={setActionError} />}
      {tab === 'players' && <PlayersTab standings={standings} hits={state.hits} onError={setActionError} />}
      {tab === 'controls' && <ControlsTab state={state} standings={standings} onError={setActionError} />}
      <WinnerOverlay winners={standings.winners} />
    </>
  )
}
