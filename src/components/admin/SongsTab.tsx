import { useMemo, useState } from 'react'
import { tallySongs } from '../../lib/standings'
import type { Hit, Pick, SongTally } from '../../lib/types'
import { useStore } from '../../store/hooks'
import { SongRow } from '../shared/SongRow'

interface Props {
  picks: Pick[]
  hits: Record<string, Hit>
  onError: (msg: string | null) => void
}

export function SongsTab({ picks, hits, onError }: Props) {
  const store = useStore()
  const [filter, setFilter] = useState('')
  const [busyKey, setBusyKey] = useState<string | null>(null)

  const tally = useMemo(() => tallySongs(picks, hits), [picks, hits])
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase()
    const list = q
      ? tally.filter((t) => `${t.song.title} ${t.song.artist} ${t.pickedBy.join(' ')}`.toLowerCase().includes(q))
      : tally
    const pending = list.filter((t) => !t.hit)
    const played = list.filter((t) => t.hit).sort((a, b) => b.hit!.at - a.hit!.at)
    return { pending, played }
  }, [tally, filter])

  const toggle = async (t: SongTally) => {
    setBusyKey(t.song.key)
    onError(null)
    try {
      if (t.hit) await store.unmarkHit(t.song.key)
      else await store.markHit(t.song)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not update that song.')
    } finally {
      setBusyKey(null)
    }
  }

  const playedCount = tally.filter((t) => t.hit).length

  return (
    <section className="card">
      <div className="row between">
        <h2 className="card-title">Songs</h2>
        <span className="pill">
          {playedCount}/{tally.length} played
        </span>
      </div>
      <p className="muted small">Tap a song when the DJ plays it. Everyone who picked it lights up instantly. Tap again to undo.</p>
      {tally.length === 0 ? (
        <p className="muted">No songs yet. Share the guest link so people can pick.</p>
      ) : (
        <>
          <input
            className="input input--search"
            type="search"
            placeholder="Filter by song, artist or guest"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter songs"
          />
          <SongList title="Not played yet" items={shown.pending} busyKey={busyKey} onToggle={toggle} />
          <SongList title="Played" items={shown.played} busyKey={busyKey} onToggle={toggle} />
        </>
      )}
    </section>
  )
}

function SongList({
  title,
  items,
  busyKey,
  onToggle,
}: {
  title: string
  items: SongTally[]
  busyKey: string | null
  onToggle: (t: SongTally) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="field">
      <span className="field-label">
        {title} ({items.length})
      </span>
      <ul className="plain-list">
        {items.map((t) => (
          <li key={t.song.key}>
            <SongRow
              song={t.song}
              hit={!!t.hit}
              onClick={busyKey ? undefined : () => onToggle(t)}
              trailing={
                <span className="song-pickers">
                  {t.pickedBy.length === 1 ? t.pickedBy[0] : `${t.pickedBy.length} people`}
                </span>
              }
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
