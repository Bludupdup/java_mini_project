# DSA Learning Platform — Java & Spring Boot Backend

A complete, production-grade **Full Stack Java Backend** built with **Spring Boot 3**, **Spring Security 6 (JWT Authentication)**, **PostgreSQL (Spring Data JPA)**, and **Google Gemini LLM Caching**.

---

## 🚀 Key Features

1. **Complete Authentication & Security**:
   - Built on **Spring Security 6** with stateless **JWT (JSON Web Token)**.
   - Passwords securely hashed with **BCrypt**.
   - Authenticated user principal injected directly via `@AuthenticationPrincipal User user`.
2. **PostgreSQL-Backed LLM Caching (Generate Once, Serve Forever)**:
   - First checks `LessonRepository` in PostgreSQL.
   - If lesson is cached, serves immediately with **0 LLM calls**.
   - If missing, calls Gemini LLM, parses into structured DTOs, and saves in a database `@Transactional` block.
   - Built-in thread-safe mutex lock prevents duplicate concurrent generation calls.
3. **Curriculum Engine**:
   - 24 algorithmic topics organized across 5 stages.
   - Associated YouTube video resources and LeetCode practice problems.
4. **Student Progress & Practice Arena**:
   - Tracks theory and code completion status per topic.
   - Records LeetCode attempts distinguishing `SELF_REPORTED` vs `VERIFIED`.
   - Aggregated dashboard statistics and `continue_learning` next topic pointer.

---

## 🛠️ Tech Stack

- **Language**: Java 17+
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 + `jjwt` (Java JWT 0.12.5)
- **Database**: PostgreSQL 16+ via Spring Data JPA / Hibernate
- **AI / LLM**: Google Gemini API via Spring RestClient with offline fallback
- **Build Tool**: Maven

---

## 📁 Project Architecture

```
learning-platform-backend-java/
├── pom.xml
├── README.md
└── src/
    └── main/
        ├── java/com/codepath/platform/
        │   ├── LearningPlatformApplication.java
        │   ├── config/
        │   │   ├── SecurityConfig.java            # Spring Security 6 + CORS + Filter Chain
        │   │   ├── JwtAuthenticationFilter.java    # Intercepts & validates Bearer tokens
        │   │   └── GlobalExceptionHandler.java    # Uniform JSON error formatting
        │   ├── entity/                            # JPA Entities (8 tables)
        │   │   ├── User.java                      # Users with BCrypt hash & roles
        │   │   ├── Stage.java                     # 5 Stages
        │   │   ├── Topic.java                     # 24 Topics
        │   │   ├── TopicVideo.java                # YouTube resources
        │   │   ├── Lesson.java                    # Cached LLM lessons
        │   │   ├── PracticeProblem.java           # LeetCode problems
        │   │   ├── UserTopicProgress.java         # Student completion state
        │   │   └── PracticeAttempt.java           # Self-reported vs verified attempts
        │   ├── repository/                        # Spring Data JPA Repositories
        │   ├── dto/                               # Request/Response Data Transfer Objects
        │   ├── service/                           # Business logic
        │   │   ├── JwtService.java                # JWT token signing & verification
        │   │   ├── AuthService.java               # Registration & login
        │   │   ├── GeminiService.java             # LLM prompt & fallback generator
        │   │   ├── LessonService.java             # Cache check -> LLM -> Save
        │   │   └── ProgressService.java           # Student dashboard & progress tracking
        │   └── controller/                        # REST Controllers
        │       ├── AuthController.java            # /api/auth
        │       ├── StageController.java           # /api/stages
        │       ├── TopicController.java           # /api/topics
        │       ├── ProgressController.java        # /api/progress
        │       └── HomeController.java            # /health & /
        └── resources/
            ├── application.properties             # DB connection, JWT secret, Gemini key
            ├── schema.sql                         # PostgreSQL table DDL
            └── data.sql                           # Seed data (24 topics, videos, users)
```

---

## 🔑 Authentication Credentials (Pre-Seeded)

The database seed initializes two default users:

| Email | Password | Role |
|---|---|---|
| `student@codepath.edu` | `password123` | `ROLE_STUDENT` |
| `admin@codepath.edu` | `password123` | `ROLE_ADMIN` |

You can also register new users anytime via `POST /api/auth/register`.

---

## ⚙️ Configuration (`src/main/resources/application.properties`)

```properties
server.port=8080

# PostgreSQL credentials
spring.datasource.url=jdbc:postgresql://localhost:5432/codepath_learning
spring.datasource.username=postgres
spring.datasource.password=your_postgres_password

# JWT secret
app.jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
app.jwt.expiration-ms=86400000

# Gemini API Key (optional for testing, required for live LLM)
gemini.api.key=YOUR_GEMINI_API_KEY
```

---

## 💻 How to Run in VS Code

### Step 1: Open Folder in VS Code
1. Open VS Code.
2. Select **File > Open Folder...** and choose:
   ```text
   C:\Users\AMAZING SHOP\.gemini\antigravity-ide\scratch\learning-platform-backend-java
   ```

### Step 2: Install VS Code Java Extension Pack
In VS Code Extensions (`Ctrl + Shift + X`), install:
- **Extension Pack for Java** (by Microsoft)
- **Spring Boot Extension Pack** (by VMware)

### Step 3: Run the Application
1. In the VS Code file explorer, navigate to:
   `src/main/java/com/codepath/platform/LearningPlatformApplication.java`
2. Click the **Run** button above the `main` method (or press `F5`).
3. Or in the terminal, run:
   ```bash
   mvn spring-boot:run
   ```

---

## 📡 API Reference

### 1. Authentication (`/api/auth`)

- **`POST /api/auth/register`**:
  ```json
  { "name": "Jane Doe", "email": "jane@example.com", "password": "securePassword123" }
  ```
  Returns: `{ "token": "ey...", "user": { "id": 3, "name": "Jane Doe", ... } }`

- **`POST /api/auth/login`**:
  ```json
  { "email": "student@codepath.edu", "password": "password123" }
  ```
  Returns: JWT token & profile.

- **`GET /api/auth/me`** *(Header: `Authorization: Bearer <token>`)*:
  Returns current authenticated user details.

### 2. Curriculum & Topics (`/api/stages`, `/api/topics`)

- **`GET /api/stages`**: Stages with grouped topics and progress percentage.
- **`GET /api/topics`**: All 24 topics with completion badges.
- **`GET /api/topics/{identifier}`**: Detailed topic data by ID (e.g. `3`) or slug (e.g. `merge-sort`). Includes YouTube videos and practice problems.

### 3. Lessons & LLM Caching (`/api/topics/{id}/lesson`)

- **`GET /api/topics/{id}/lesson`**:
  - If in DB: returns cached lesson immediately (`"isCached": true`).
  - If not in DB: calls Gemini LLM, parses JSON, saves in DB in a transaction, and returns result.
  - Query param `?force=true` forces regeneration.
- **`POST /api/topics/{id}/lesson/generate`**: Explicit force re-generation endpoint.

### 4. Student Progress (`/api/progress`) *(Requires `Authorization: Bearer <token>`)*

- **`POST /api/progress/topic`**:
  ```json
  { "topicId": 3, "theoryCompleted": true, "codeCompleted": true }
  ```
- **`POST /api/progress/practice-attempt`**:
  ```json
  {
    "practiceProblemId": 3,
    "attemptStatus": "SOLVED",
    "verificationStatus": "SELF_REPORTED",
    "notes": "Solved using divide-and-conquer in 20 minutes"
  }
  ```
- **`GET /api/progress/dashboard`**: Overall completion percentages, practice problem stats, and `continueLearning` next topic pointer.
