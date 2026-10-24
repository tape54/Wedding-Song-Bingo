import { describe, expect, it } from 'vitest'
import { WEDDING_SONGS } from '../src/data/weddingSongs'
import { mergeResults, searchLocal } from '../src/lib/localSearch'
import { songKey } from '../src/lib/songKey'
import type { Song } from '../src/lib/types'

describe('built-in catalog', () => {
  it('has a few hundred well-formed entries', () => {
    expect(WEDDING_SONGS.length).toBeGreaterThan(400)
    for (const s of WEDDING_SONGS) {
      expect(s.title.length).toBeGreaterThan(0)
      expect(s.artist.length).toBeGreaterThan(0)
      expect(s.title.length).toBeLessThanOrEqual(200)
    }
  })
})

describe('searchLocal', () => {
  const titles = (q: string) => searchLocal(q).map((s) => `${s.title} - ${s.artist}`)

  it('finds songs by partial title, ignoring punctuation and case', () => {
    expect(titles('brightside')[0]).toBe('Mr. Brightside - The Killers')
    expect(titles('mr bright')[0]).toBe('Mr. Brightside - The Killers')
    expect(titles('gimme gimme')[0]).toBe('Gimme! Gimme! Gimme! (A Man After Midnight) - ABBA')
    expect(titles('dont stop believ')[0]).toBe("Don't Stop Believin' - Journey")
  })

  it('finds songs by artist', () => {
    expect(titles('abba').length).toBe(12)
    expect(titles('abba').every((t) => t.endsWith('ABBA'))).toBe(true)
    // Biggest hits first, not alphabetical.
    expect(titles('abba')[0]).toBe('Dancing Queen - ABBA')
  })

  it('ranks a title-prefix match first', () => {
    expect(titles('september')[0]).toBe('September - Earth, Wind & Fire')
  })

  it('returns nothing for very short or unknown terms', () => {
    expect(searchLocal('a')).toEqual([])
    expect(searchLocal('zzqx nonsense')).toEqual([])
  })

  it('dedupes catalog entries and keys them like other picks', () => {
    const r = searchLocal('mr brightside')
    expect(r.filter((s) => s.key === songKey('Mr. Brightside', 'The Killers'))).toHaveLength(1)
  })
})

describe('mergeResults', () => {
  const s = (title: string, artworkUrl?: string): Song => ({
    key: songKey(title, 'X'),
    title,
    artist: 'X',
    source: artworkUrl ? 'itunes' : 'manual',
    artworkUrl,
  })

  it('keeps local order, upgrades artwork from online, appends extra online songs', () => {
    const merged = mergeResults([s('A'), s('B')], [s('B', 'https://art/b.jpg'), s('C', 'https://art/c.jpg')])
    expect(merged.map((m) => m.title)).toEqual(['A', 'B', 'C'])
    expect(merged[1].artworkUrl).toBe('https://art/b.jpg')
  })

  it('caps the list', () => {
    const many = Array.from({ length: 20 }, (_, i) => s(`S${i}`))
    expect(mergeResults(many, [], 10)).toHaveLength(10)
  })

  it('shows plenty of an artist’s songs', () => {
    expect(searchLocal('abba', 12).length).toBe(12)
  })
})
