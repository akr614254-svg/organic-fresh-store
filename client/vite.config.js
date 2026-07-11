import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Needed so tunnels like ngrok can reach the dev server — Vite 6+
    // blocks requests from hostnames it doesn't recognise by default.
    host: true,
    allowedHosts: true,
  },
  test: {
    // e2e/ holds Playwright specs (run via `npm run test:e2e`), not Vitest
    // ones — without this, Vitest's default glob also picks them up and
    // fails trying to import '@playwright/test'.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
