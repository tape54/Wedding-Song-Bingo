import type { Hit, Pick } from '../../lib/types'
import { SongRow } from '../shared/SongRow'

interface Props {
  pick: Pick
  hits: Record<string, Hit>
  locked: boolean
  onEdit: () => void
}

export function MyCard({ pick, hits, locked, onEdit }: Props) {
  const hitCount = pick.songs.filter((s) => s.key in hits).length
  return (
    <section className="card card--mine">
      <div className="row between">
        <h2 className="card-title">Your picks, {pick.name}</h2>
        <span className={`pill ${hitCount === pick.songs.length ? 'pill--win' : ''}`}>
          {hitCount}/{pick.songs.length} played
        </span>
      </div>
      <ul className="plain-list">
        {pick.songs.map((s) => (
          <li key={s.key}>
            <SongRow song={s} hit={s.key in hits} />
          </li>
        ))}
      </ul>
      {locked ? (
        <p className="muted small">Picks are locked for the dance floor. Good luck! 🍀</p>
      ) : (
        <button type="button" className="btn btn--ghost" onClick={onEdit}>
          Edit my picks
        </button>
      )}
    </section>
  )
}
