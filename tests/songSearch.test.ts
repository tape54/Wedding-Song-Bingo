import { afterEach, describe, expect, it, vi } from 'vitest'
import { ItunesSearchProvider, jsonp, manualSong, mapItunesResults } from '../src/lib/songSearch'

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
  it('queries the iTunes API, caches by term, and skips short terms', async () => {
    const transport = vi.fn(async (_url: string) => sample as unknown)
    const provider = new ItunesSearchProvider(transport)

    expect(await provider.search('m')).toEqual([])
    expect(transport).not.toHaveBeenCalled()

    const first = await provider.search('Mr Bright')
    expect(first).toHaveLength(2)
    const url = String(transport.mock.calls[0][0])
    expect(url).toContain('https://itunes.apple.com/search?')
    expect(url).toContain('term=mr+bright')
    expect(url).toContain('entity=song')

    await provider.search('mr bright ')
    expect(transport).toHaveBeenCalledTimes(1)
  })

  it('surfaces transport failures so the UI can offer manual entry', async () => {
    const provider = new ItunesSearchProvider(async () => {
      throw new Error('Song search could not load')
    })
    await expect(provider.search('hello')).rejects.toThrow(/could not load/)
  })
})

describe('jsonp', () => {
  afterEach(() => {
    vi.useRealTimers()
    document.head.querySelectorAll('script').forEach((s) => s.remove())
  })

  const lastScript = () => {
    const scripts = document.head.querySelectorAll('script')
    return scripts[scripts.length - 1] as HTMLScriptElement
  }
  const callbackName = (script: HTMLScriptElement) => new URL(script.src).searchParams.get('callback')!

  it('adds a callback parameter, resolves with the payload, and cleans up', async () => {
    const p = jsonp('https://itunes.apple.com/search?term=x')
    const script = lastScript()
    expect(script.src).toMatch(/^https:\/\/itunes\.apple\.com\/search\?term=x&callback=__wsbJsonp/)
    const cb = callbackName(script)
    ;(window as unknown as Record<string, (d: unknown) => void>)[cb]({ resultCount: 0, results: [] })
    await expect(p).resolves.toEqual({ resultCount: 0, results: [] })
    expect(script.isConnected).toBe(false)
    // A duplicate late response is harmless.
    expect(() => (window as unknown as Record<string, (d: unknown) => void>)[cb]({})).not.toThrow()
  })

  it('rejects when the script fails to load', async () => {
    const p = jsonp('https://itunes.apple.com/search?term=x')
    lastScript().dispatchEvent(new Event('error'))
    await expect(p).rejects.toThrow(/could not load/)
  })

  it('rejects on timeout', async () => {
    vi.useFakeTimers()
    const p = jsonp('https://itunes.apple.com/search?term=x', undefined, 1000)
    vi.advanceTimersByTime(1001)
    await expect(p).rejects.toThrow(/timed out/)
  })

  it('rejects with AbortError when aborted', async () => {
    const controller = new AbortController()
    const p = jsonp('https://itunes.apple.com/search?term=x', controller.signal)
    controller.abort()
    await expect(p).rejects.toMatchObject({ name: 'AbortError' })
  })
})

describe('manualSong', () => {
  it('trims and keys free-text entries so they match catalog picks', () => {
    const s = manualSong('  Mr. Brightside ', ' The Killers ')
    expect(s).toMatchObject({ title: 'Mr. Brightside', artist: 'The Killers', source: 'manual' })
    expect(s.key).toBe(mapItunesResults(sample)[0].key)
  })
})
