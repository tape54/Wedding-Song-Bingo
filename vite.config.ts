/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from GitHub Pages at https://<user>.github.io/Wedding-Song-Bingo/
export default defineConfig({
  plugins: [react()],
  base: '/Wedding-Song-Bingo/',
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/rules/**'],
  },
})
