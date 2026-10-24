import type { Hit, Standings } from '../../lib/types'
import { SongRow } from '../shared/SongRow'

interface Props {
  standings: Standings
  hits: Record<string, Hit>
  currentUid?: string
}

export function EveryonesPicks({ standings, hits, currentUid }: Props) {
  const { players } = standings
  return (
    <section className="card">
      <div className="row between">
        <h2 className="card-title">Everyone’s picks</h2>
        <span className="muted small">{players.length} playing</span>
      </div>
      {players.length === 0 ? (
        <p className="muted">No one has picked yet. Be the first!</p>
      ) : (
        <ul className="plain-list players">
          {players.map((p) => {
            const total = p.pick.songs.length
            const done = p.completedAt !== null
            const mine = p.pick.id === currentUid
            return (
              <li key={p.pick.id} className={`player ${done ? 'player--done' : ''} ${mine ? 'player--mine' : ''}`}>
                <div className="row between">
                  <h3 className="player-name">
                    {p.pick.name}
                    {mine && <span className="you"> (you)</span>}
                  </h3>
                  <span className={`pill ${done ? 'pill--win' : p.hitCount === total - 1 ? 'pill--close' : ''}`}>
                    {done ? '🏆 BINGO' : `${p.hitCount}/${total}`}
                  </span>
                </div>
                <ul className="plain-list">
                  {p.pick.songs.map((s) => (
                    <li key={s.key}>
                      <SongRow song={s} hit={s.key in hits} compact />
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/** Shown to guests before the dance floor opens: picks are a secret until then. */
export function PicksHidden() {
  return (
    <section className="card picks-hidden">
      <h2 className="card-title">Everyone’s picks</h2>
      <p className="muted">
        🤫 Picks are secret until the dance floor opens. The moment picks lock, everyone’s songs are revealed here
        and you can watch them light up.
      </p>
    </section>
  )
}
