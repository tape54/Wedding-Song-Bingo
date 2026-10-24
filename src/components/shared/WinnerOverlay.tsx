import confetti from 'canvas-confetti'
import { useEffect, useState } from 'react'
import type { PlayerStanding } from '../../lib/types'
import { SongRow } from './SongRow'

interface Props {
  winners: PlayerStanding[]
  currentUid?: string
}

function fireConfetti() {
  const end = Date.now() + 3500
  const colors = ['#f7d774', '#ffffff', '#ff8fab', '#b4a0ff']
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors })
    confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  confetti({ particleCount: 160, spread: 100, startVelocity: 45, origin: { y: 0.6 }, colors })
  frame()
}

/** Shown on every phone the moment someone's third song plays. */
export function WinnerOverlay({ winners, currentUid }: Props) {
  const key = winners.map((w) => w.pick.id).sort().join(',')
  const [dismissedKey, setDismissedKey] = useState<string | null>(null)
  const visible = winners.length > 0 && dismissedKey !== key

  useEffect(() => {
    if (!visible) return
    try {
      fireConfetti()
    } catch {
      /* canvas unavailable */
    }
  }, [visible, key])

  if (!visible) return null
  const youWon = currentUid !== undefined && winners.some((w) => w.pick.id === currentUid)
  const names = winners.map((w) => w.pick.name)
  const title = youWon
    ? 'YOU WON! 🏆'
    : winners.length > 1
      ? `${joinNames(names)} win! 🏆`
      : `${names[0]} wins! 🏆`

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="winner-title">
      <div className="overlay-card">
        <div className="overlay-emoji" aria-hidden="true">
          🎉
        </div>
        <h2 id="winner-title" className="overlay-title">
          {title}
        </h2>
        <p className="overlay-sub">
          {winners.length > 1 ? 'Their third songs played at the same time. Co-winners!' : 'All 3 songs have played. BINGO!'}
        </p>
        {winners.map((w) => (
          <div key={w.pick.id} className="overlay-winner">
            {winners.length > 1 && <h3 className="overlay-name">{w.pick.name}</h3>}
            {w.pick.songs.map((s) => (
              <SongRow key={s.key} song={s} hit compact />
            ))}
          </div>
        ))}
        <button type="button" className="btn btn--ghost" onClick={() => setDismissedKey(key)}>
          Keep watching
        </button>
      </div>
    </div>
  )
}

function joinNames(names: string[]): string {
  if (names.length <= 2) return names.join(' and ')
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}
