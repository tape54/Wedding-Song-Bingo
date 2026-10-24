import { useEffect, useState } from 'react'
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS, type SongSearchProvider } from '../lib/songSearch'
import type { Song } from '../lib/types'

export type SearchStatus = 'idle' | 'searching' | 'results' | 'empty' | 'error'

interface Completed {
  term: string
  results: Song[]
  error: boolean
}

/** Debounced catalog search. Status is derived from the last completed request. */
export function useSongSearch(provider: SongSearchProvider, term: string): { results: Song[]; status: SearchStatus } {
  const [completed, setCompleted] = useState<Completed | null>(null)
  const q = term.trim()

  useEffect(() => {
    if (q.length < MIN_SEARCH_LENGTH) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const results = await provider.search(q, controller.signal)
        if (!controller.signal.aborted) setCompleted({ term: q, results, error: false })
      } catch {
        if (!controller.signal.aborted) setCompleted({ term: q, results: [], error: true })
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [provider, q])

  if (q.length < MIN_SEARCH_LENGTH) return { results: [], status: 'idle' }
  if (!completed || completed.term !== q) return { results: [], status: 'searching' }
  if (completed.error) return { results: [], status: 'error' }
  return { results: completed.results, status: completed.results.length ? 'results' : 'empty' }
}
