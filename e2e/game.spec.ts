import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test'

const MODE = process.env.E2E_MODE === 'emulator' ? 'emulator' : 'demo'
const APP = MODE === 'demo' ? '/Wedding-Song-Bingo/?demo=1' : '/Wedding-Song-Bingo/'
const VIEWPORT = { width: 390, height: 844 }

// itunes.apple.com is stubbed so the test is deterministic and offline.
const catalog = [
  { kind: 'song', trackId: 1, trackName: 'Mr. Brightside', artistName: 'The Killers' },
  { kind: 'song', trackId: 2, trackName: 'September', artistName: 'Earth, Wind & Fire' },
  { kind: 'song', trackId: 3, trackName: 'Shut Up and Dance', artistName: 'WALK THE MOON' },
  { kind: 'song', trackId: 4, trackName: 'Uptown Funk (feat. Bruno Mars)', artistName: 'Mark Ronson' },
  { kind: 'song', trackId: 5, trackName: 'Zebra Wedding Waltz', artistName: 'The Obscure Testers', artworkUrl100: 'https://example.invalid/100x100bb.jpg' },
]

let jsonpRequests = 0

async function stubCatalog(ctx: BrowserContext) {
  await ctx.route('https://itunes.apple.com/**', (route) => {
    // Mirrors what real browsers experience: only JSONP (with a callback) works.
    const params = new URL(route.request().url()).searchParams
    const term = (params.get('term') ?? '').toLowerCase()
    const results = catalog.filter((r) => `${r.trackName} ${r.artistName}`.toLowerCase().includes(term))
    const json = JSON.stringify({ resultCount: results.length, results })
    jsonpRequests += params.has('callback') ? 1 : 0
    const callback = params.get('callback')
    void route.fulfill(
      callback
        ? { status: 200, contentType: 'text/javascript', body: `\n\n\n${callback}(${json});` }
        : // Plain fetch() fails in real browsers (no CORS), so fail it here too.
          { status: 403, contentType: 'text/plain', body: 'blocked' },
    )
  })
}

/**
 * Demo mode shares localStorage across tabs of one context (each tab is a guest).
 * Emulator mode needs a context per "phone" so each gets its own Firebase identity.
 */
class Phones {
  private shared: BrowserContext | null = null
  constructor(private browser: Browser) {}

  async open(path = APP): Promise<Page> {
    let ctx: BrowserContext
    if (MODE === 'demo') {
      if (!this.shared) {
        this.shared = await this.browser.newContext({ viewport: VIEWPORT })
        await stubCatalog(this.shared)
      }
      ctx = this.shared
    } else {
      ctx = await this.browser.newContext({ viewport: VIEWPORT })
      await stubCatalog(ctx)
    }
    const page = await ctx.newPage()
    page.on('pageerror', (e) => console.log('pageerror:', e.message))
    await page.goto(path)
    return page
  }
}

async function resetBackend(page: Page) {
  if (MODE === 'demo') {
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
  } else {
    const project = 'demo-wedding-song-bingo'
    await page.request.delete(`http://127.0.0.1:8080/emulator/v1/projects/${project}/databases/(default)/documents`)
    await page.request.delete(`http://127.0.0.1:9099/emulator/v1/projects/${project}/accounts`)
    await page.reload()
  }
}

async function submitPicks(page: Page, name: string, terms: string[]) {
  await page.getByPlaceholder('So we know who to cheer for').fill(name)
  for (const [i, term] of terms.entries()) {
    await page.getByLabel(`Song ${i + 1}`, { exact: true }).fill(term)
    await page.getByRole('option').first().click()
  }
  await page.getByRole('button', { name: 'Lock in my picks' }).click()
  await expect(page.getByText(`Your picks, ${name}`)).toBeVisible()
}

test(`full game in ${MODE} mode: picks, lock, hits, winner, undo, reset`, async ({ browser }) => {
  const phones = new Phones(browser)

  // Sam picks three songs; the entry survives a reload (identity persists).
  const sam = await phones.open()
  await resetBackend(sam)
  await submitPicks(sam, 'Sam', ['bright', 'septem', 'shut up'])
  await sam.reload()
  await expect(sam.getByText('Your picks, Sam')).toBeVisible()
  await expect(sam.getByText('Picks are secret until the dance floor opens', { exact: false })).toBeVisible()

  // Jo joins from another phone. Picks stay secret until the admin locks.
  const jo = await phones.open()
  await expect(jo.getByText('Picks are secret until the dance floor opens', { exact: false })).toBeVisible()
  await submitPicks(jo, 'Jo', ['bright', 'uptown', 'septem'])
  await expect(jo.getByRole('heading', { name: 'Sam' })).toHaveCount(0)
  await expect(sam.getByRole('heading', { name: /^Jo/ })).toHaveCount(0)

  // A duplicate song is refused.
  await jo.getByRole('button', { name: 'Edit my picks' }).click()
  await jo.getByRole('button', { name: /Remove song 3/ }).click()
  await jo.getByLabel('Song 3', { exact: true }).fill('bright')
  await jo.getByRole('option').first().click()
  await expect(jo.getByRole('alert')).toContainText('already picked')
  await jo.getByRole('button', { name: 'Cancel' }).click()

  // Admin sets a PIN on first visit; a wrong PIN is rejected later.
  const admin = await phones.open(`${APP}#/admin`)
  await admin.getByLabel('PIN', { exact: true }).fill('123456')
  await admin.getByLabel('Confirm PIN').fill('123456')
  await admin.getByRole('button', { name: 'Save PIN and continue' }).click()
  await expect(admin.getByRole('tab', { name: 'Songs' })).toBeVisible()
  await expect(admin.getByText('0/4 played')).toBeVisible()

  await admin.getByRole('tab', { name: 'Controls' }).click()
  await admin.getByRole('button', { name: 'Sign out of admin' }).click()
  await expect(admin.getByRole('heading', { name: 'Admin PIN' })).toBeVisible()
  await admin.getByLabel('PIN', { exact: true }).fill('000000')
  await admin.getByRole('button', { name: 'Enter' }).click()
  await expect(admin.getByRole('alert')).toContainText('Wrong PIN')
  await admin.getByLabel('PIN', { exact: true }).fill('123456')
  await admin.getByRole('button', { name: 'Enter' }).click()
  await expect(admin.getByRole('tab', { name: 'Songs' })).toBeVisible()

  // Coming back later: the admin stays signed in (the bug was a forever "Connecting…").
  await admin.reload()
  await expect(admin.getByRole('tab', { name: 'Songs' })).toBeVisible({ timeout: 15_000 })

  // Lock: guests see the banner and lose the edit button.
  await admin.getByRole('tab', { name: 'Controls' }).click()
  await admin.getByRole('button', { name: /Lock picks/ }).click()
  await expect(sam.getByRole('status')).toContainText('Picks are locked')
  await expect(sam.getByRole('button', { name: 'Edit my picks' })).toHaveCount(0)

  // Locking reveals everyone's picks on every phone.
  await expect(sam.getByText('2 playing')).toBeVisible()
  await expect(sam.getByRole('heading', { name: /^Jo/ })).toBeVisible()
  await expect(jo.getByRole('heading', { name: /^Sam/ })).toBeVisible()

  // Hits propagate live; Jo's third song makes Jo the winner everywhere.
  await admin.getByRole('tab', { name: 'Songs' }).click()
  await admin.getByRole('button', { name: /Mr\. Brightside/ }).click()
  await admin.getByRole('button', { name: /September/ }).click()
  await expect(sam.getByText('2/3 played')).toBeVisible()
  await expect(admin.getByText('2/4 played')).toBeVisible()

  await admin.getByRole('button', { name: /Uptown Funk/ }).click()
  await expect(jo.locator('#winner-title')).toHaveText('YOU WON! 🏆')
  await expect(sam.locator('#winner-title')).toHaveText('Jo wins! 🏆')
  await expect(admin.locator('#winner-title')).toHaveText('Jo wins! 🏆')

  // Undo removes the celebration; redo brings it back.
  await admin.getByRole('button', { name: 'Keep watching' }).click()
  await admin.getByRole('button', { name: /Uptown Funk/ }).click()
  await expect(sam.getByRole('dialog')).toHaveCount(0)
  await expect(jo.getByRole('dialog')).toHaveCount(0)

  // Admin can remove a player; reset clears everything and unlocks.
  await admin.getByRole('tab', { name: 'Players' }).click()
  admin.once('dialog', (d) => void d.accept())
  await admin.getByRole('button', { name: 'Remove Jo' }).click()
  await expect(admin.getByText('1 playing')).toBeVisible()
  await expect(jo.getByRole('status')).toContainText('Picks are locked')

  await admin.getByRole('tab', { name: 'Controls' }).click()
  admin.on('dialog', (d) => void d.accept())
  await admin.getByRole('button', { name: /Reset game/ }).click()
  await expect(sam.getByRole('heading', { name: 'Pick your 3 songs' })).toBeVisible()
})

test('song search: built-in list is instant, online catalog adds more, and failures are explained', async ({ browser }) => {
  // Online catalog reachable (JSONP only): a song that isn't built in appears.
  const ctx = await browser.newContext({ viewport: VIEWPORT })
  await stubCatalog(ctx)
  const page = await ctx.newPage()
  await page.goto(APP)
  const before = jsonpRequests
  await page.getByLabel('Song 1', { exact: true }).fill('zebra wedding')
  await expect(page.getByRole('option', { name: /Zebra Wedding Waltz/ })).toBeVisible()
  expect(jsonpRequests).toBeGreaterThan(before)
  // A built-in song shows even before the online answer arrives.
  await page.getByLabel('Song 1', { exact: true }).fill('dancing que')
  await expect(page.getByRole('option', { name: /Dancing Queen/ })).toBeVisible()
  await ctx.close()

  // Online catalog down: built-in songs still listed, with the reason shown.
  const offline = await browser.newContext({ viewport: VIEWPORT })
  await offline.route('https://itunes.apple.com/**', (route) => route.abort('blockedbyclient'))
  const p2 = await offline.newPage()
  await p2.goto(APP)
  await p2.getByLabel('Song 1', { exact: true }).fill('gimme gimme')
  await expect(p2.getByRole('option', { name: /Gimme! Gimme! Gimme!/ })).toBeVisible()
  await expect(p2.getByText('Online search isn’t reachable', { exact: false })).toBeVisible()
  await p2.getByLabel('Song 1', { exact: true }).fill('zebra wedding')
  await expect(p2.getByText('online search isn’t reachable right now', { exact: false })).toBeVisible()
  await expect(p2.getByRole('button', { name: /Type it in manually/ })).toBeVisible()
  await p2.screenshot({ path: 'test-results/search-offline.png' })
  await offline.close()
})

