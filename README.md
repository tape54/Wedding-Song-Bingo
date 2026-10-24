# 🎶 Wedding Song Bingo

A mobile-friendly web page for the wedding game where every guest picks **3 songs**.
Once the dance floor opens, the host marks songs as the DJ plays them. The first
guest whose 3 songs have all played wins, and every phone lights up with confetti.

- Guests open one link, type their name, and pick songs from a type-ahead list.
  No accounts, no app to install.
- Picks stay secret until you lock them. Then everyone's picks are revealed and
  light up live as songs play. The admin always sees all picks.
- The admin (you) has a PIN-protected page to **lock picks** when the dance floor
  starts, **mark songs as played**, see standings, and reset.
- Hosted free on GitHub Pages; live data on Firebase's free plan. No credit card,
  and no new accounts beyond the Google and GitHub accounts you already have.

## How the game works

1. Before the wedding, share the link (or the QR code from the admin page). Guests
   enter a name and 3 songs. They can edit their picks any time until you lock.
2. When the dance floor opens, tap **Lock picks** on the admin page. That also
   reveals everyone's picks on every phone.
3. As each song plays, tap it on the admin **Songs** tab. Everyone who picked it
   gets a tick instantly. Tap again if you made a mistake.
4. The moment someone's third song plays, every phone shows the winner. If one
   song completes two people at once, they're co-winners.

Songs are matched by title and artist, so two guests who picked different
editions of "Mr. Brightside" still share one entry on your Songs tab.

## Try it right now (demo mode)

```bash
npm install
npm run dev
```

Open the printed URL. Until Firebase is configured the app runs in **demo mode**:
everything works, but data stays on this device (open a second tab to play as
another guest). The admin page is at `/#/admin`.

## Set it up for real (about 10 minutes)

### 1. Create a Firebase project (uses your Google account, free)

1. Go to <https://console.firebase.google.com> and click **Add project** (or
   **Create a project**). Name it anything, e.g. `wedding-song-bingo`.
2. You can turn **Google Analytics off**. Click **Create project**.
3. On the project overview, click the **`</>` (Web)** icon to add a web app.
   Give it a nickname, leave Firebase Hosting unchecked, click **Register app**.
4. You'll see a `firebaseConfig = { apiKey: ..., projectId: ..., ... }` block.
   Copy those values into [`src/firebaseConfig.ts`](src/firebaseConfig.ts),
   replacing the placeholder. (These values are safe to commit; access is
   controlled by the security rules in the next step, not by hiding them.)

### 2. Create the database and publish the security rules

1. In the left menu: **Build → Firestore Database → Create database**.
2. Pick a location near the venue, choose **Start in production mode**, click
   **Enable**.
3. Open the **Rules** tab, delete what's there, paste the entire contents of
   [`firestore.rules`](firestore.rules), and click **Publish**.

   Alternatively, from this folder: `npx firebase login` (opens your Google
   login) then `npx firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`.

### 3. Turn on sign-in methods

1. **Build → Authentication → Get started**.
2. On the **Sign-in method** tab enable **Anonymous** (guests) and
   **Email/Password** (just the first toggle; this is how your admin PIN works).
3. On the **Settings** tab → **Authorized domains** → **Add domain** →
   `tape54.github.io` (your GitHub Pages domain).

### 4. Publish the site on GitHub Pages

1. In this GitHub repo: **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. Commit `src/firebaseConfig.ts` and merge to the `main` branch. The
   [deploy workflow](.github/workflows/deploy.yml) runs the tests, builds, and
   publishes to **https://tape54.github.io/Wedding-Song-Bingo/**.

### 5. Set your admin PIN and share

1. Open <https://tape54.github.io/Wedding-Song-Bingo/#/admin>. The first visit asks
   you to **set a PIN** (4–12 digits; 6 is a good choice). Write it down: it
   can't be changed from the app (see Troubleshooting if you forget it).
2. The **Controls** tab shows the guest link and a QR code. Share away.

You stay signed in as admin for 24 hours after entering the PIN, so enter it once
on the day and you're set. Anyone else who opens the admin page just sees the PIN
prompt.

Want to play too? Enter your own picks from a different browser or phone than the
one you use for the admin page: signing in as admin gives that browser a new
guest identity.

### Quick check on your phone (2 minutes)

- Open the guest link, type a name, start typing a song: a pick list should
  appear. Pick 3 and save. Reload: your picks should still be there.
- Open the admin link on another device (or a private window), enter your PIN,
  tap one of your songs on the Songs tab. The first phone should tick it within a
  second without refreshing.
- On the admin **Controls** tab tap **Lock picks**; the guest phone should show
  the lock banner. Unlock again until the big day.

## Google Sheet backup

Every time a guest saves their picks, the site can also copy them to a Google
Sheet, one row per guest (an edit updates that guest's row). The admin
**Controls** tab also has **Send all picks to Google Sheet** and **Download
picks (CSV)**, which works even without the sheet.

One-time setup, easiest on a computer:

1. Open the backup sheet in Google Sheets. Choose **Extensions → Apps Script**.
2. Delete what's in the editor, paste the contents of
   [`backup/Code.gs`](backup/Code.gs), and click **Save**.
3. Click **Deploy → New deployment**. Under "Select type" (gear icon) choose
   **Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Click
   **Deploy**, then **Authorize access** and allow it with your Google account.
   Google may warn that the app isn't verified: choose **Advanced → Go to
   (project name)**, since it's your own script.
4. Copy the **Web app URL** (it ends in `/exec`) and paste it into
   [`src/backupConfig.ts`](src/backupConfig.ts). Commit to `main` to publish.

Opening the web app URL in a browser shows "Wedding Song Bingo backup is
running." Anyone with that URL could add rows to the sheet, so it's a backup,
not the source of truth; the game itself runs on Firebase.

## On the night

- Keep the admin page open on your phone (Songs tab). Tap songs as they play.
- If the DJ plays something nobody picked, there's nothing to tap.
- Standings are on the **Players** tab and on every guest's screen.
- Winner appears automatically. Tap **Keep watching** to dismiss the overlay.
- Made a mistake? Tap the song again to un-play it; the winner recalculates.

## Troubleshooting

| Symptom | Fix |
|---|---|
| A **"Demo mode"** badge shows in the header | `src/firebaseConfig.ts` still has the placeholder, or the committed config hasn't deployed yet. |
| "You don't have permission" when saving | Security rules weren't published (step 2), or you're on a domain not in Authorized domains (step 3). |
| Guests see "Connecting…" forever | Anonymous sign-in isn't enabled (step 3), or the domain isn't authorized. |
| Song search shows "isn't reachable" | The free iTunes search is rate-limited per network; wait a minute or use **Type it in manually**. |
| Forgot the admin PIN | In the Firebase console: **Authentication → Users**, delete `admin@weddingsongbingo.app`; then **Firestore → config → admin**, delete that document. Reopen `/#/admin` to set a new PIN. |
| Want to start over | Admin **Controls → Reset game** deletes every pick and all played songs. |

## Development

```bash
npm run dev            # demo mode on http://localhost:5173/Wedding-Song-Bingo/
npm run dev:emulator   # run against local Firebase Auth + Firestore emulators (needs Java)
npm test               # unit tests (song matching, winner logic, search, store)
npm run test:rules     # Firestore security-rule tests on the emulator
npm run e2e            # Playwright end-to-end in demo mode
npm run e2e:emulator   # the same flow against FirestoreGameStore on the emulators
npm run lint && npm run build
```

Project layout:

- `src/lib/` pure game logic: `songKey.ts` (matching editions of a song),
  `standings.ts` (progress, winner, ties), `songSearch.ts` (iTunes type-ahead),
  `validate.ts`, `adminSession.ts` (24-hour admin sign-in).
- `src/store/` the `GameStore` interface with two implementations:
  `FirestoreGameStore` (real, multi-device) and `LocalGameStore` (demo mode).
- `src/components/guest/` pick form, my card, everyone's picks.
- `src/components/admin/` PIN gate, Songs / Players / Controls tabs.
- `firestore.rules` who may write what; tested in `tests/rules/`.

Data model in Firestore: `picks/{guestUid}` (name, 3 songs), `game/state`
(`locked`, `hits` keyed by song), `config/admin` (the admin's uid).
