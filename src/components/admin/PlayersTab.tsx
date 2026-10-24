import type { Hit, Standings } from '../../lib/types'
import { useStore } from '../../store/hooks'
import { SongRow } from '../shared/SongRow'

interface Props {
  standings: Standings
  hits: Record<string, Hit>
  onError: (msg: string | null) => void
}

export function PlayersTab({ standings, hits, onError }: Props) {
  const store = useStore()
  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name}'s entry? They can submit again while picks are unlocked.`)) return
    onError(null)
    try {
      await store.deletePick(id)
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Could not remove that entry.')
    }
  }

  return (
    <section className="card">
      <div className="row between">
        <h2 className="card-title">Players</h2>
        <span className="muted small">{standings.players.length} playing</span>
      </div>
      {standings.players.length === 0 ? (
        <p className="muted">Nobody has submitted picks yet.</p>
      ) : (
        <ul className="plain-list players">
          {standings.players.map((p) => (
            <li key={p.pick.id} className={`player ${p.completedAt !== null ? 'player--done' : ''}`}>
              <div className="row between">
                <h3 className="player-name">{p.pick.name}</h3>
                <span className="row gap">
                  <span className={`pill ${p.completedAt !== null ? 'pill--win' : ''}`}>
                    {p.completedAt !== null ? '🏆 BINGO' : `${p.hitCount}/${p.pick.songs.length}`}
                  </span>
                  <button type="button" className="icon-btn" aria-label={`Remove ${p.pick.name}`} onClick={() => remove(p.pick.id, p.pick.name)}>
                    🗑
                  </button>
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
          ))}
        </ul>
      )}
    </section>
  )
}
