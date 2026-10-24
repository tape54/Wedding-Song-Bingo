import { describe, expect, it } from 'vitest'
import { normalizeTitle, primaryArtist, songKey } from '../src/lib/songKey'

describe('normalizeTitle', () => {
  it('lowercases, strips punctuation and diacritics', () => {
    expect(normalizeTitle("Don't Stop Believin'")).toBe('dont stop believin')
    expect(normalizeTitle('Déjà Vu')).toBe('deja vu')
    expect(normalizeTitle('Mr. Brightside')).toBe('mr brightside')
  })

  it('drops bracketed qualifiers and feat. credits', () => {
    expect(normalizeTitle('Uptown Funk (feat. Bruno Mars)')).toBe('uptown funk')
    expect(normalizeTitle('Hey Ya! [Radio Mix]')).toBe('hey ya')
    expect(normalizeTitle('Crazy in Love feat. Jay-Z')).toBe('crazy in love')
  })

  it('drops dash-separated edition suffixes but keeps other dashes', () => {
    expect(normalizeTitle("Don't Stop Me Now - Remastered 2011")).toBe('dont stop me now')
    expect(normalizeTitle('September - Single Version')).toBe('september')
    expect(normalizeTitle('Shut Up and Dance - Live')).toBe('shut up and dance')
    expect(normalizeTitle('Ob-La-Di, Ob-La-Da')).toBe('ob la di ob la da')
  })

  it('treats & and "and" the same', () => {
    expect(normalizeTitle('Shut Up & Dance')).toBe(normalizeTitle('Shut Up and Dance'))
  })
})

describe('primaryArtist', () => {
  it('keeps only the lead artist', () => {
    expect(primaryArtist('Mark Ronson feat. Bruno Mars')).toBe('mark ronson')
    expect(primaryArtist('Daft Punk ft. Pharrell Williams')).toBe('daft punk')
    expect(primaryArtist('Doja Cat x SZA')).toBe('doja cat')
  })

  it('does not split band names that contain & or commas', () => {
    expect(primaryArtist('Earth, Wind & Fire')).toBe('earth wind and fire')
    expect(primaryArtist('Simon & Garfunkel')).toBe('simon and garfunkel')
  })
})

describe('songKey', () => {
  it('matches different editions of the same song', () => {
    const a = songKey('Mr. Brightside', 'The Killers')
    expect(songKey('Mr. Brightside (Remastered)', 'The Killers')).toBe(a)
    expect(songKey('Mr. Brightside - Live at Glastonbury', 'The Killers')).toBe(a)
    expect(songKey('MR. BRIGHTSIDE', 'the killers')).toBe(a)
  })

  it('distinguishes different songs and different artists', () => {
    expect(songKey('Hello', 'Adele')).not.toBe(songKey('Hello', 'Lionel Richie'))
    expect(songKey('Yellow', 'Coldplay')).not.toBe(songKey('Fix You', 'Coldplay'))
  })
})
