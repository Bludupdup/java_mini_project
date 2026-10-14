import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { createBackendAuth } from './server/backendAuth.js'
import { createModelCaller } from './server/llm.js'
import { visualizeApi } from './server/visualizeApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // The '' prefix loads every variable from .env.local, not just VITE_ ones.
  // This runs in Node, so the key goes to the server plugin and never to the browser.
  const env = loadEnv(mode, process.cwd(), '')

  // The Java backend (learning-platform-backend-java): accounts, topics, progress.
  const backendUrl = env.BACKEND_URL || 'http://localhost:8080'

  // /api/* goes to the Java backend, except /api/visualize, which the plugin
  // below answers first (plugin routes run before the proxy).
  const proxy = { '/api': { target: backendUrl } }

  return {
    plugins: [
      react(),
      // OpenRouter when OPENROUTER_API_KEY is set, otherwise Gemini (see server/llm.js).
      visualizeApi({ llm: createModelCaller(env), getRequestUser: createBackendAuth(backendUrl) }),
    ],
    server: { proxy },
    preview: { proxy },
  }
})
