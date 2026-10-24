import { defineConfig } from '@playwright/test'

// E2E_MODE=demo (default) runs against the on-device demo store.
// E2E_MODE=emulator runs against FirestoreGameStore on local Firebase emulators
// (use `npm run e2e:emulator`, which starts them).
export default defineConfig({
  testDir: 'e2e',
  timeout: 90_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx vite --port 5173 --strictPort',
    url: 'http://localhost:5173/Wedding-Song-Bingo/',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
