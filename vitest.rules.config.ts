import { defineConfig } from 'vitest/config'

// Firestore security-rule tests. Run with: npm run test:rules (needs Java for the emulator).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 20000,
    hookTimeout: 30000,
  },
})
