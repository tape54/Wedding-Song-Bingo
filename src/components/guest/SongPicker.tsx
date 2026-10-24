import { useId, useState } from 'react'
import { useSongSearch } from '../../hooks/useSongSearch'
import { manualSong, type SongSearchProvider } from '../../lib/songSearch'
import type { Song } from '../../lib/types'
import { SongRow } from '../shared/SongRow'

interface Props {
  slot: number
  provider: SongSearchProvider
  onPick: (song: Song) => void
  autoFocus?: boolean
}

/** Type-ahead song search with a manual "Title / Artist" fallback. */
export function SongPicker({ slot, provider, onPick, autoFocus }: Props) {
  const [term, setTerm] = useState('')
  const [manual, setManual] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualArtist, setManualArtist] = useState('')
  const { results, status, onlineError } = useSongSearch(provider, term)
  const listId = useId()

  const pick = (song: Song) => {
    onPick(song)
    setTerm('')
    setManual(false)
    setManualTitle('')
    setManualArtist('')
  }

  const addManual = () => {
    if (!manualTitle.trim() || !manualArtist.trim()) return
    pick(manualSong(manualTitle, manualArtist))
  }

  if (manual) {
    return (
      <div className="picker picker--manual" data-slot={slot}>
        <div className="picker-label">Song {slot + 1}: enter it yourself</div>
        <input
          className="input"
          placeholder="Song title"
          value={manualTitle}
          onChange={(e) => setManualTitle(e.target.value)}
          autoFocus
          aria-label={`Song ${slot + 1} title`}
        />
        <input
          className="input"
          placeholder="Artist"
          value={manualArtist}
          onChange={(e) => setManualArtist(e.target.value)}
          aria-label={`Song ${slot + 1} artist`}
          onKeyDown={(e) => e.key === 'Enter' && addManual()}
        />
        <div className="row gap">
          <button type="button" className="btn btn--primary" onClick={addManual} disabled={!manualTitle.trim() || !manualArtist.trim()}>
            Add song
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => setManual(false)}>
            Back to search
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="picker" data-slot={slot}>
      <input
        className="input input--search"
        type="search"
        placeholder={`Song ${slot + 1}: start typing a title or artist…`}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={status === 'results'}
        aria-controls={listId}
        aria-label={`Song ${slot + 1}`}
      />
      {status === 'searching' && <div className="picker-hint">Searching…</div>}
      {status === 'results' && (
        <ul className="picker-results" id={listId} role="listbox">
          {results.map((song) => (
            <li key={song.key} role="option" aria-selected={false}>
              <SongRow song={song} compact onClick={() => pick(song)} />
            </li>
          ))}
        </ul>
      )}
      {status === 'empty' && <div className="picker-hint">No matches for “{term}”.</div>}
      {status === 'error' && (
        <div className="picker-hint picker-hint--error">
          No match in our song list, and online search isn’t reachable right now.
          <span className="picker-why"> ({onlineError})</span>
        </div>
      )}
      {status === 'results' && onlineError && (
        <div className="picker-hint">
          Showing popular wedding songs. Online search isn’t reachable
          <span className="picker-why"> ({onlineError})</span>.
        </div>
      )}
      {(status === 'empty' || status === 'error' || status === 'results') && (
        <button type="button" className="link" onClick={() => { setManual(true); setManualTitle(term) }}>
          Can’t find it? Type it in manually
        </button>
      )}
    </div>
  )
}
