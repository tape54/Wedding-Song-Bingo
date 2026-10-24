import { useEffect, useState, type ReactNode } from 'react'
import { StoreContext } from './context'
import { createStore, type GameStore } from './index'

export function StoreProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [store, setStore] = useState<GameStore | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    createStore().then(setStore, (e: unknown) => setError(e instanceof Error ? e.message : String(e)))
  }, [])
  if (error) return <div className="page center">Could not start: {error}</div>
  if (!store) return <>{fallback}</>
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
