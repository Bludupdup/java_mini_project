# DSA Universe — Java & Spring Boot Backend

The REST API behind the DSA Universe React app: **Spring Boot 3.5**, **Spring Security** with **JWT** logins, **PostgreSQL** through **Spring Data JPA**, and **Flyway** migrations.

It stores:

- **the topic catalog**: 24 topics with their theory, steps, complexity table, pseudocode, links and LeetCode problems
- **the algorithm library**: 18 algorithms from the team's `algorithms` table (codepath_backup.sql), each with steps, a worked example, a C++ program and its output, complexities, applications and a LeetCode problem
- **accounts**: name, email and a BCrypt password hash
- **each learner's data**: progress per topic, saved topics, solved problems, notes, achievements, study days (for streaks) and preferences

---

## How the pieces fit

```
Browser (React, http://localhost:5173)
   │  fetch("/api/...")  + login cookie
   ▼
Vite dev server ── /api/visualize ──► Node plugin (server/visualizeApi.js) ──► OpenRouter / Gemini
   │                                     │ asks GET /api/auth/me who is logged in
   │  every other /api/* is proxied      ▼
   └───────────────────────────────► Spring Boot (http://localhost:8080) ──► PostgreSQL (codepath_learning)
```

The proxy makes the page and the API share one address, so the login cookie works without CORS.

---

## Setup (once per computer)

1. **Java 17** – `winget install EclipseAdoptium.Temurin.17.JDK`, then open a new terminal.
2. **PostgreSQL 17** – `winget install PostgreSQL.PostgreSQL.17`. Remember the password you give the `postgres` user.
3. **Create the database:**
   ```bat
   "C:\Program Files\PostgreSQL\17\bin\createdb.exe" -U postgres codepath_learning
   ```
4. **Your settings:** copy `.env.example` to `.env.local` (in this folder) and fill in `DB_PASSWORD`, plus a `JWT_SECRET` (the file shows how to make one). `.env.local` is gitignored, so your password stays on your computer.

Maven doesn't need installing: `mvnw.cmd` (the Maven wrapper) downloads the right version the first time.

> **Had the old version of this backend?** Its tables (`stages`, `lessons`, ...) don't match the new ones. Start from an empty database:
> `dropdb -U postgres codepath_learning` then `createdb -U postgres codepath_learning`.

## Run it

```bat
run.bat
```

or `mvnw.cmd spring-boot:run`, or `npm run backend` from the repository root. On start, Flyway creates the tables and loads the topic catalog. Check it with http://localhost:8080/api/health.

Then start the React app in a second terminal from the repository root: `npm run dev`, and open http://localhost:5173.

## Tests

```bat
mvnw.cmd test
```

Unit tests check the account rules, JWTs and the login limiter. `ApiIntegrationTest` runs the whole app against PostgreSQL (in a separate `it_test` schema that it wipes each run), so PostgreSQL must be running. Use `mvnw.cmd package -DskipTests` to build without it.

---

## Database

Flyway runs the SQL files in `src/main/resources/db/migration`:

| File | What it does |
|---|---|
| `V1__create_tables.sql` | Creates every table. Runs once per database; never edit it after that — add `V2__...sql` instead. |
| `V2__create_algorithms_table.sql` | Creates the `algorithms` table (the team's table, plus `topic_id`). |
| `R__seed_catalog.sql` | Inserts or updates the topic catalog. Runs again whenever the file changes, so edit lesson content here and restart. |
| `R__seed_catalog_algorithms.sql` | Inserts or updates the 18 algorithms. Runs after the catalog (Flyway orders repeatables by name). Its header lists what differs from the original dump. |

Tables:

| Table | One row per |
|---|---|
| `topics` | topic (`slug` is the id used in URLs, e.g. `arrays`) |
| `topic_structures`, `topic_steps`, `topic_complexities`, `topic_resources` | item in one of a topic's ordered lists |
| `practice_problems` | LeetCode problem (`slug` from its URL, e.g. `two-sum`) |
| `algorithms` | algorithm in the library, linked to its topic (`topic_id`) |
| `users` | account (email stored lower-case, password as a BCrypt hash) |
| `user_preferences` | user who changed a setting |
| `topic_progress` | user × topic they opened (visited, completed, visualization steps seen) |
| `bookmarks` | user × saved topic |
| `problem_progress` | user × problem they solved or wrote a note on |
| `activity_days` | user × day they studied |
| `user_achievements` | user × unlocked achievement |

Deleting a user deletes all of their rows (`ON DELETE CASCADE`).

## Logins

`POST /api/auth/login` checks the password with BCrypt and answers with a cookie:

```
Set-Cookie: dsa_session=<JWT>; Path=/; Max-Age=604800; HttpOnly; SameSite=Lax
```

- The **JWT** is a signed note "this is user 42 until <date>". Only the server knows the signing key (`JWT_SECRET`), so it can't be forged, and the server doesn't need to store sessions.
- **HttpOnly** means page scripts can't read the cookie. **SameSite=Lax** means other websites' requests don't carry it.
- `JwtAuthenticationFilter` reads the cookie (or an `Authorization: Bearer <JWT>` header, for Postman) on every request and looks the user up.
- After 5 wrong passwords for one email, logins for it wait 15 minutes.
- Without `JWT_SECRET`, a random key is used, so everyone is logged out when the server restarts.

---

## API

Errors always look like `{ "error": "message", "fields": { "email": "message for that input" } }`.

### Accounts — `/api/auth`

| Route | Body | Answer |
|---|---|---|
| `POST /register` | `{ name, email, password }` | `201 { user }` + cookie. Rules: name 1–40 characters, a valid email, password 8–128 characters and not the email. |
| `POST /login` | `{ email, password }` | `200 { user }` + cookie, `401` wrong email or password, `429` locked for 15 minutes |
| `POST /logout` | – | deletes the cookie |
| `GET /me` | – | `{ user }`, or `401` when not logged in |

`user` is `{ id, name, email }`.

### Topics — `/api/topics` (no login needed)

| Route | Answer |
|---|---|
| `GET /api/topics` | `{ topics: [...] }`, each with `id`, `title`, `category`, `level`, `theory`, `steps`, `complexity`, `pseudocode`, `resources`, `problems`, ... |
| `GET /api/topics/{slug}` | one topic, or `404` |

### Algorithms — `/api/algorithms` (no login needed)

| Route | Answer |
|---|---|
| `GET /api/algorithms` | `{ algorithms: [...] }`, each with `id`, `name`, `topic`, `description`, `complexity` |
| `GET /api/algorithms/{slug}` | everything: `working`, `example`, `cppCode`, `output`, `recurrence`, `complexity`, `applications`, `advantages`, `disadvantages`, `youtubeUrl`, `leetcode`; or `404` |

Each topic from `/api/topics` also lists its `algorithms` (`id`, `name`).

### Learning data — `/api/learning` (login needed)

`GET /api/learning` returns everything in the shape the frontend keeps it (times are milliseconds since 1970, like JavaScript's `Date.now()`):

```json
{
  "bookmarks": ["graphs", "arrays"],
  "topics": { "arrays": { "visitedAt": 1760430000000, "visualization": { "seen": 4, "total": 8 } } },
  "problems": { "two-sum": { "solvedAt": 1760430000000, "note": "hash map" } },
  "activityDays": ["2026-10-13", "2026-10-14"],
  "achievements": { "first-steps": 1760430000000 },
  "notificationsSeenAt": 0,
  "preferences": { "name": "", "playbackSpeed": "normal", "reduceMotion": false }
}
```

Each change has its own route and answers `204 No Content`:

| Route | Body |
|---|---|
| `POST /topics/{slug}/visit` | – |
| `PUT /topics/{slug}/completed` | `{ completed: true }` |
| `PUT /topics/{slug}/visualization` | `{ step: 3, total: 8 }` (the furthest step is kept) |
| `PUT` / `DELETE /bookmarks/{slug}` | – (save / unsave) |
| `PUT /problems/{slug}/solved` | `{ solved: true }` |
| `PUT /problems/{slug}/note` | `{ note: "..." }` (up to 2000 characters; empty removes it) |
| `POST /achievements` | `{ ids: ["first-steps"] }` |
| `PUT /notifications-seen` | – |
| `PATCH /preferences` | any of `{ name, playbackSpeed: "slow" \| "normal" \| "fast", reduceMotion }` |
| `DELETE /progress` | – resets progress, solved marks and achievements; keeps saved topics, notes and preferences |
| `DELETE /` | – erases everything |
| `PUT /` | a whole state (Settings → Import); answers with what was kept |

Routes that count as studying (visit, complete, a new visualization step, solving) also record today in `activity_days`. The browser sends its time zone in an `X-Time-Zone` header, so "today" is the learner's own day.

---

## Project layout

```
src/main/java/com/codepath/platform/
├── LearningPlatformApplication.java
├── config/       SecurityConfig, JwtAuthenticationFilter, SessionCookie, AuthenticatedUser
├── controller/   AuthController, TopicController, AlgorithmController, LearningController, HomeController
├── dto/          JSON shapes (Java records)
├── entity/       one class per table
├── exception/    ApiException + GlobalExceptionHandler (the JSON error shape)
├── repository/   Spring Data JPA repositories
└── service/      AuthService, AuthValidation, JwtService, LoginAttemptLimiter, CatalogService, AlgorithmService, LearningService
src/main/resources/
├── application.properties
└── db/migration/ V1__create_tables.sql, V2__create_algorithms_table.sql, R__seed_catalog.sql, R__seed_catalog_algorithms.sql
```
