import type { ReactNode } from 'react'
import type { Song } from '../../lib/types'

interface Props {
  song: Song
  hit?: boolean
  compact?: boolean
  trailing?: ReactNode
  onClick?: () => void
  className?: string
}

export function SongRow({ song, hit, compact, trailing, onClick, className = '' }: Props) {
  const body = (
    <>
      <span className={`song-art ${compact ? 'song-art--sm' : ''}`} aria-hidden="true">
        {song.artworkUrl ? <img src={song.artworkUrl} alt="" loading="lazy" /> : <span>🎵</span>}
      </span>
      <span className="song-text">
        <span className="song-title">{song.title}</span>
        <span className="song-artist">{song.artist}</span>
      </span>
      {hit !== undefined && (
        <span className={`hit-badge ${hit ? 'hit-badge--hit' : ''}`} aria-label={hit ? 'played' : 'not played yet'}>
          {hit ? '✓' : '·'}
        </span>
      )}
      {trailing}
    </>
  )
  const cls = `song-row ${compact ? 'song-row--compact' : ''} ${hit ? 'song-row--hit' : ''} ${className}`
  if (onClick) {
    return (
      <button type="button" className={`${cls} song-row--button`} onClick={onClick}>
        {body}
      </button>
    )
  }
  return <div className={cls}>{body}</div>
}
