import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { authApi } from './server/authApi.js'
import { createAuthStore } from './server/authStore.js'
import { createModelCaller } from './server/llm.js'
import { visualizeApi } from './server/visualizeApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The '' prefix loads every variable from .env.local, not just VITE_ ones.
  // This runs in Node, so the key goes to the server plugin and never to the browser.
  const env = loadEnv(mode, process.cwd(), '')

  // Accounts and sessions live in .data/ (gitignored), next to this file.
  const authStore = createAuthStore(resolve(process.cwd(), '.data', 'auth.json'))

  return {
    plugins: [
      react(),
      authApi(authStore),
      // OpenRouter when OPENROUTER_API_KEY is set, otherwise Gemini (see server/llm.js).
      visualizeApi({ llm: createModelCaller(env), authStore }),
    ],
  }
})
