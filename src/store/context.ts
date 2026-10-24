import { createContext } from 'react'
import type { GameStore } from './index'

export const StoreContext = createContext<GameStore | null>(null)
