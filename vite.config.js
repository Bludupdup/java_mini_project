import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { visualizeApi } from './server/visualizeApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The '' prefix loads every variable from .env.local, not just VITE_ ones.
  // This runs in Node, so the key goes to the server plugin and never to the browser.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      visualizeApi({
        apiKey: env.GEMINI_API_KEY,
        model: env.GEMINI_MODEL || 'gemini-3.8-flash',
      }),
    ],
  }
})
