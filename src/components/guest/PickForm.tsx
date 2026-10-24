import { useState } from 'react'
import type { SongSearchProvider } from '../../lib/songSearch'
import { SONGS_PER_PICK, type Pick, type Song } from '../../lib/types'
import { validatePick } from '../../lib/validate'
import { StoreError } from '../../store'
import { useStore } from '../../store/hooks'
import { SongRow } from '../shared/SongRow'
import { SongPicker } from './SongPicker'

interface Props {
  existing: Pick | null
  provider: SongSearchProvider
  onDone: () => void
}

export function PickForm({ existing, provider, onDone }: Props) {
  const store = useStore()
  const [name, setName] = useState(existing?.name ?? '')
  const [songs, setSongs] = useState<Song[]>(existing?.songs ?? [])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const addSong = (song: Song) => {
    setError(null)
    if (songs.some((s) => s.key === song.key)) {
      setError(`You already picked “${song.title}”. Choose a different song.`)
      return
    }
    setSongs((prev) => (prev.length < SONGS_PER_PICK ? [...prev, song] : prev))
  }
  const removeSong = (key: string) => setSongs((prev) => prev.filter((s) => s.key !== key))

  const save = async () => {
    const problem = validatePick(name, songs)
    if (problem) {
      setError(problem)
      return
    }
    setSaving(true)
    setError(null)
    try {
      await store.savePick({ name, songs })
      onDone()
    } catch (e) {
      setError(e instanceof StoreError ? e.message : 'Could not save. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="card">
      <h2 className="card-title">{existing ? 'Edit your picks' : 'Pick your 3 songs'}</h2>
      <p className="muted">
        Choose 3 songs you think will play on the dance floor. First guest to hear all 3 wins.
      </p>
      <label className="field">
        <span className="field-label">Your name</span>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="So we know who to cheer for"
          maxLength={40}
          autoComplete="name"
        />
      </label>

      <div className="field">
        <span className="field-label">
          Your songs <span className="muted">({songs.length}/{SONGS_PER_PICK})</span>
        </span>
        <ol className="chosen-list">
          {songs.map((song, i) => (
            <li key={song.key}>
              <SongRow
                song={song}
                trailing={
                  <button type="button" className="icon-btn" aria-label={`Remove song ${i + 1}: ${song.title}`} onClick={() => removeSong(song.key)}>
                    ✕
                  </button>
                }
              />
            </li>
          ))}
        </ol>
        {songs.length < SONGS_PER_PICK && (
          <SongPicker key={songs.length} slot={songs.length} provider={provider} onPick={addSong} autoFocus={songs.length > 0} />
        )}
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <div className="row gap">
        <button type="button" className="btn btn--primary btn--big" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : existing ? 'Save changes' : 'Lock in my picks'}
        </button>
        {existing && (
          <button type="button" className="btn btn--ghost" onClick={onDone} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </section>
  )
}
