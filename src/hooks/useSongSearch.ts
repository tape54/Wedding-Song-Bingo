import { useEffect, useMemo, useState } from 'react'
import { mergeResults, searchLocal } from '../lib/localSearch'
import { MIN_SEARCH_LENGTH, SEARCH_DEBOUNCE_MS, type SongSearchProvider } from '../lib/songSearch'
import type { Song } from '../lib/types'

export type SearchStatus = 'idle' | 'searching' | 'results' | 'empty' | 'error'

interface Completed {
  term: string
  results: Song[]
  error: string | null
}

export interface SongSearchResult {
  results: Song[]
  status: SearchStatus
  /** Why the online catalog failed for this term, if it did. */
  onlineError: string | null
}

/**
 * Built-in catalog matches show instantly; the online catalog (debounced) adds
 * more and upgrades artwork when it answers. Status reflects both.
 */
export function useSongSearch(
  provider: SongSearchProvider,
  term: string,
  local: (q: string) => Song[] = searchLocal,
): SongSearchResult {
  const [completed, setCompleted] = useState<Completed | null>(null)
  const q = term.trim()
  const short = q.length < MIN_SEARCH_LENGTH

  useEffect(() => {
    if (short) return
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const results = await provider.search(q, controller.signal)
        if (!controller.signal.aborted) setCompleted({ term: q, results, error: null })
      } catch (e) {
        if (!controller.signal.aborted) {
          setCompleted({ term: q, results: [], error: e instanceof Error ? e.message : String(e) })
        }
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [provider, q, short])

  const localResults = useMemo(() => (short ? [] : local(q)), [local, q, short])

  if (short) return { results: [], status: 'idle', onlineError: null }
  const done = completed !== null && completed.term === q
  const results = mergeResults(localResults, done ? completed.results : [])
  const onlineError = done ? completed.error : null
  let status: SearchStatus
  if (results.length) status = 'results'
  else if (!done) status = 'searching'
  else status = onlineError ? 'error' : 'empty'
  return { results, status, onlineError }
}
