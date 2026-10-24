import { describe, expect, it } from 'vitest'
import { manualSong } from '../src/lib/songSearch'
import { validatePick } from '../src/lib/validate'

const three = [manualSong('A', 'X'), manualSong('B', 'X'), manualSong('C', 'X')]

describe('validatePick', () => {
  it('accepts a good entry', () => {
    expect(validatePick('Sam', three)).toBeNull()
  })
  it('rejects a missing or too-long name', () => {
    expect(validatePick('   ', three)).toMatch(/name/i)
    expect(validatePick('x'.repeat(41), three)).toMatch(/40/)
  })
  it('requires exactly three distinct songs with titles and artists', () => {
    expect(validatePick('Sam', three.slice(0, 2))).toMatch(/exactly 3/)
    expect(validatePick('Sam', [three[0], three[0], three[1]])).toMatch(/same song/)
    expect(validatePick('Sam', [three[0], three[1], manualSong('', 'X')])).toMatch(/title and an artist/)
  })
})
