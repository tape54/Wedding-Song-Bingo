import { describe, expect, it } from 'vitest'
import { computeStandings, tallySongs } from '../src/lib/standings'
import type { Hit, Pick, Song } from '../src/lib/types'

const song = (title: string, artist = 'Artist'): Song => ({
  key: `${title.toLowerCase()}|${artist.toLowerCase()}`,
  title,
  artist,
  source: 'manual',
})
const pick = (id: string, name: string, titles: string[], createdAt = 1): Pick => ({
  id,
  name,
  songs: titles.map((t) => song(t)),
  createdAt,
  updatedAt: createdAt,
})
const hit = (title: string, at: number): [string, Hit] => [
  song(title).key,
  { at, title, artist: 'Artist' },
]

const sam = pick('u1', 'Sam', ['A', 'B', 'C'])
const jo = pick('u2', 'Jo', ['A', 'B', 'D'])
const lee = pick('u3', 'Lee', ['X', 'Y', 'Z'])

describe('computeStandings', () => {
  it('has no winner and sorts by hit count then name when nothing is complete', () => {
    const { players, winners } = computeStandings(
      [lee, jo, sam],
      Object.fromEntries([hit('A', 100), hit('X', 50)]),
    )
    expect(winners).toEqual([])
    expect(players.map((p) => [p.pick.name, p.hitCount])).toEqual([
      ['Jo', 1],
      ['Lee', 1],
      ['Sam', 1],
    ])
  })

  it('declares the player whose third song played first the winner', () => {
    const hits = Object.fromEntries([hit('A', 100), hit('B', 200), hit('D', 300), hit('C', 400)])
    const { players, winners } = computeStandings([sam, jo, lee], hits)
    expect(winners.map((w) => w.pick.name)).toEqual(['Jo'])
    expect(winners[0].completedAt).toBe(300)
    expect(players.map((p) => p.pick.name)).toEqual(['Jo', 'Sam', 'Lee'])
    expect(players[1].completedAt).toBe(400)
  })

  it('reports co-winners when one song completes two people at once', () => {
    const both = pick('u4', 'Ash', ['A', 'B', 'C'], 2)
    const hits = Object.fromEntries([hit('A', 100), hit('B', 200), hit('C', 300)])
    const { winners } = computeStandings([sam, both, jo], hits)
    expect(winners.map((w) => w.pick.name).sort()).toEqual(['Ash', 'Sam'])
  })

  it('recomputes when a hit is undone', () => {
    const hits = Object.fromEntries([hit('A', 100), hit('B', 200), hit('C', 300)])
    expect(computeStandings([sam], hits).winners).toHaveLength(1)
    delete hits[song('C').key]
    const after = computeStandings([sam], hits)
    expect(after.winners).toEqual([])
    expect(after.players[0].hitCount).toBe(2)
  })

  it('ignores hits for songs nobody picked and empty picks', () => {
    const hits = Object.fromEntries([hit('Q', 5)])
    const { players, winners } = computeStandings([{ ...sam, songs: [] }], hits)
    expect(winners).toEqual([])
    expect(players[0].hitCount).toBe(0)
  })
})

describe('tallySongs', () => {
  it('groups songs across players, most popular first, with hit status', () => {
    const hits = Object.fromEntries([hit('B', 10)])
    const tally = tallySongs([sam, jo, lee], hits)
    expect(tally[0].song.title).toBe('A')
    expect(tally[0].pickedBy).toEqual(['Sam', 'Jo'])
    expect(tally.find((t) => t.song.title === 'B')?.hit?.at).toBe(10)
    expect(tally.find((t) => t.song.title === 'X')?.hit).toBeNull()
    expect(tally).toHaveLength(7)
  })
})
