import { useMemo, useState } from 'react'
import type { SongSearchProvider } from '../../lib/songSearch'
import { computeStandings } from '../../lib/standings'
import { useGameState, usePicks, useUser } from '../../store/hooks'
import { Connecting } from '../shared/Connecting'
import { LockedBanner } from '../shared/LockedBanner'
import { WinnerOverlay } from '../shared/WinnerOverlay'
import { EveryonesPicks, PicksHidden } from './EveryonesPicks'
import { MyCard } from './MyCard'
import { PickForm } from './PickForm'

export function GuestPage({ provider }: { provider: SongSearchProvider }) {
  const user = useUser()
  const { state, error: stateError } = useGameState()
  const { picks, error: picksError } = usePicks()
  // The form shows whenever the guest has no entry yet, when they tap Edit, and
  // from the start of a save until the store confirms it, so a flaky connection
  // can't show "Your picks" for a write that never reached the server.
  const [formOpen, setFormOpen] = useState(false)

  const mine = useMemo(() => picks.find((p) => p.id === user?.uid) ?? null, [picks, user])
  const standings = useMemo(() => computeStandings(picks, state.hits), [picks, state.hits])
  const error = stateError ?? picksError

  const showForm = !state.locked && user !== null && (formOpen || !mine)

  return (
    <>
      {state.locked && <LockedBanner hasPick={mine !== null} />}
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {showForm ? (
        <PickForm existing={mine} provider={provider} onSaveStart={() => setFormOpen(true)} onDone={() => setFormOpen(false)} />
      ) : mine ? (
        <MyCard pick={mine} hits={state.hits} locked={state.locked} onEdit={() => setFormOpen(true)} />
      ) : state.locked ? null : (
        <Connecting />
      )}
      {state.locked ? (
        <EveryonesPicks standings={standings} hits={state.hits} currentUid={user?.uid} />
      ) : (
        <PicksHidden />
      )}
      <WinnerOverlay winners={standings.winners} currentUid={user?.uid} />
    </>
  )
}
