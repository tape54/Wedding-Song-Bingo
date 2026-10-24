import { useContext, useEffect, useState } from 'react'
import { EMPTY_STATE, type GameState, type Pick } from '../lib/types'
import type { GameStore, StoreUser } from './index'
import { StoreContext } from './context'

export function useStore(): GameStore {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}

export function useUser(): StoreUser | null {
  const store = useStore()
  const [user, setUser] = useState<StoreUser | null>(null)
  useEffect(() => store.subscribeUser(setUser), [store])
  return user
}

export function useGameState(): { state: GameState; error: string | null } {
  const store = useStore()
  const [state, setState] = useState<GameState>(EMPTY_STATE)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => store.subscribeState(setState, (e) => setError(e.message)), [store])
  return { state, error }
}

export function usePicks(): { picks: Pick[]; error: string | null } {
  const store = useStore()
  const [picks, setPicks] = useState<Pick[]>([])
  const [error, setError] = useState<string | null>(null)
  useEffect(() => store.subscribePicks(setPicks, (e) => setError(e.message)), [store])
  return { picks, error }
}
