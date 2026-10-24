import { useMemo, useState } from 'react'
import type { SongSearchProvider } from '../../lib/songSearch'
import { computeStandings } from '../../lib/standings'
import { useGameState, usePicks, useUser } from '../../store/hooks'
import { LockedBanner } from '../shared/LockedBanner'
import { WinnerOverlay } from '../shared/WinnerOverlay'
import { EveryonesPicks } from './EveryonesPicks'
import { MyCard } from './MyCard'
import { PickForm } from './PickForm'

export function GuestPage({ provider }: { provider: SongSearchProvider }) {
  const user = useUser()
  const { state, error: stateError } = useGameState()
  const { picks, error: picksError } = usePicks()
  const [editing, setEditing] = useState(false)

  const mine = useMemo(() => picks.find((p) => p.id === user?.uid) ?? null, [picks, user])
  const standings = useMemo(() => computeStandings(picks, state.hits), [picks, state.hits])
  const error = stateError ?? picksError

  const showForm = !state.locked && (editing || (!mine && user !== null))

  return (
    <>
      {state.locked && <LockedBanner hasPick={mine !== null} />}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {showForm ? (
        <PickForm existing={mine} provider={provider} onDone={() => setEditing(false)} />
      ) : mine ? (
        <MyCard pick={mine} hits={state.hits} locked={state.locked} onEdit={() => setEditing(true)} />
      ) : state.locked ? null : (
        <p className="muted center">Connecting…</p>
      )}
      <EveryonesPicks standings={standings} hits={state.hits} currentUid={user?.uid} />
      <WinnerOverlay winners={standings.winners} currentUid={user?.uid} />
    </>
  )
}
