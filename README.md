# java_mini_project
java mini project  , 2501106 2501107 2501108

**DSA Universe**: learn data structures and algorithms with lessons, AI-generated step-by-step visualizations, practice problems, progress tracking, streaks and achievements.

| Part | Technology | Folder |
|---|---|---|
| Frontend | React 19 + Vite | `src/` |
| Backend | Java 17, Spring Boot 3.5, Spring Security (JWT), Spring Data JPA | `learning-platform-backend-java/` |
| Database | PostgreSQL 17, tables managed by Flyway | `learning-platform-backend-java/src/main/resources/db/migration/` |
| AI visualizations | Node (a Vite plugin) calling OpenRouter or Gemini | `server/` |

## Run it

You need Node 20+, Java 17 and PostgreSQL. First-time setup (database, password file) is in [the backend README](learning-platform-backend-java/README.md#setup-once-per-computer).

```bat
:: terminal 1 — the Java backend on http://localhost:8080
npm run backend

:: terminal 2 — the React app on http://localhost:5173
npm install
npm run dev
```

Open http://localhost:5173 and create an account. Topics, accounts and all progress are stored in PostgreSQL.

`.env.local` in the repository root holds the AI keys (`OPENROUTER_API_KEY` or `GEMINI_API_KEY`). The backend's database password lives in `learning-platform-backend-java/.env.local`.

## Tests

```bat
npm test               :: frontend + Node (Vitest)
npm run test:backend   :: Java (JUnit; PostgreSQL must be running)
npm run lint
```
