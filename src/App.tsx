import { useMemo } from 'react'
import { AdminPage } from './components/admin/AdminPage'
import { GuestPage } from './components/guest/GuestPage'
import { useHashRoute } from './hooks/useHashRoute'
import { ItunesSearchProvider } from './lib/songSearch'
import { useStore } from './store/hooks'
import { StoreProvider } from './store/StoreContext'

function Shell() {
  const route = useHashRoute()
  const store = useStore()
  const provider = useMemo(() => new ItunesSearchProvider(), [])
  return (
    <div className="page">
      <header className="header">
        <a className="brand" href="#/">
          <span className="brand-mark" aria-hidden="true">🎶</span>
          <span>
            <span className="brand-title">Wedding Song Bingo</span>
            <span className="brand-sub">Pick 3 songs. First to hear all 3 wins.</span>
          </span>
        </a>
        {store.mode === 'demo' && (
          <span className="demo-badge" title="Firebase isn't configured; data stays on this device">
            Demo mode
          </span>
        )}
      </header>
      <main className="main">{route === 'admin' ? <AdminPage /> : <GuestPage provider={provider} />}</main>
      <footer className="footer">
        {route === 'admin' ? <a href="#/">← Guest view</a> : <a href="#/admin">Admin</a>}
        <span className="version">v{__APP_VERSION__}</span>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider fallback={<div className="page center">Loading…</div>}>
      <Shell />
    </StoreProvider>
  )
}
