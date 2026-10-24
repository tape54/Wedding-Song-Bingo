import { describe, expect, it, vi } from 'vitest'
import { ItunesSearchProvider, manualSong, mapItunesResults } from '../src/lib/songSearch'

const sample = {
  resultCount: 4,
  results: [
    {
      wrapperType: 'track',
      kind: 'song',
      trackId: 1,
      trackName: 'Mr. Brightside',
      artistName: 'The Killers',
      artworkUrl100: 'https://img/100x100bb.jpg',
    },
    { kind: 'song', trackId: 2, trackName: 'Mr. Brightside (Remastered)', artistName: 'The Killers' },
    { kind: 'music-video', trackId: 3, trackName: 'Mr. Brightside', artistName: 'The Killers' },
    { kind: 'song', trackId: 4, trackName: 'Somebody Told Me', artistName: 'The Killers' },
  ],
}

describe('mapItunesResults', () => {
  it('maps tracks, dedupes editions, skips non-songs, upsizes artwork', () => {
    const songs = mapItunesResults(sample)
    expect(songs.map((s) => s.title)).toEqual(['Mr. Brightside', 'Somebody Told Me'])
    expect(songs[0].artworkUrl).toBe('https://img/200x200bb.jpg')
    expect(songs[0].source).toBe('itunes')
    expect(songs[0].key).toBe('mr brightside|the killers')
  })

  it('tolerates garbage input', () => {
    expect(mapItunesResults(null)).toEqual([])
    expect(mapItunesResults({ results: 'nope' })).toEqual([])
    expect(mapItunesResults({ results: [{ kind: 'song' }] })).toEqual([])
  })
})

describe('ItunesSearchProvider', () => {
  it('calls the iTunes API, caches by term, and skips short terms', async () => {
    const fetchFn = vi.fn(async (_input: RequestInfo | URL) => new Response(JSON.stringify(sample), { status: 200 }))
    const provider = new ItunesSearchProvider(fetchFn as unknown as typeof fetch)

    expect(await provider.search('m')).toEqual([])
    expect(fetchFn).not.toHaveBeenCalled()

    const first = await provider.search('Mr Bright')
    expect(first).toHaveLength(2)
    const url = String(fetchFn.mock.calls[0][0])
    expect(url).toContain('https://itunes.apple.com/search?')
    expect(url).toContain('term=mr+bright')
    expect(url).toContain('entity=song')

    await provider.search('mr bright ')
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('throws on a non-OK response so the UI can offer manual entry', async () => {
    const fetchFn = vi.fn(async (_input: RequestInfo | URL) => new Response("rate limited", { status: 403 }))
    const provider = new ItunesSearchProvider(fetchFn as unknown as typeof fetch)
    await expect(provider.search('hello')).rejects.toThrow(/403/)
  })
})

describe('manualSong', () => {
  it('trims and keys free-text entries so they match catalog picks', () => {
    const s = manualSong('  Mr. Brightside ', ' The Killers ')
    expect(s).toMatchObject({ title: 'Mr. Brightside', artist: 'The Killers', source: 'manual' })
    expect(s.key).toBe(mapItunesResults(sample)[0].key)
  })
})
