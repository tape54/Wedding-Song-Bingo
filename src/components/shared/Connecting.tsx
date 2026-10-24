import { useEffect, useState } from 'react'

/** "Connecting…", plus advice and a reload button if it takes more than a few seconds. */
export function Connecting({ slowAfterMs = 8000 }: { slowAfterMs?: number }) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), slowAfterMs)
    return () => clearTimeout(t)
  }, [slowAfterMs])
  return (
    <div className="center-block" role="status">
      <p className="muted">Connecting…</p>
      {slow && (
        <div className="card">
          <p className="muted small">
            This is taking longer than usual. Check your signal, then reload. If you opened this link from inside
            another app, try opening it in Safari or Chrome instead.
          </p>
          <button type="button" className="btn" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )}
    </div>
  )
}
