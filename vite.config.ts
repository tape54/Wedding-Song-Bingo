/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from GitHub Pages at https://<user>.github.io/Wedding-Song-Bingo/
export default defineConfig({
  plugins: [react()],
  define: {
    // Shown in the footer so we can tell which build a phone has loaded.
    __APP_VERSION__: JSON.stringify((process.env.GITHUB_SHA ?? 'dev').slice(0, 7)),
  },
  base: '/Wedding-Song-Bingo/',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/rules/**'],
  },
})
