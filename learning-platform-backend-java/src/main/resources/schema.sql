-- ========================================================
-- Learning Platform Prototype - PostgreSQL Schema for Spring Boot
-- ========================================================

CREATE TABLE IF NOT EXISTS stages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sequence_number INT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS topics (
    id SERIAL PRIMARY KEY,
    stage_id INT NOT NULL REFERENCES stages(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    sequence_number INT NOT NULL UNIQUE,
    slug VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS topic_videos (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    title VARCHAR(250) NOT NULL,
    sequence_number INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL UNIQUE REFERENCES topics(id) ON DELETE CASCADE,
    theory TEXT NOT NULL,
    algorithm TEXT NOT NULL,
    code_examples TEXT NOT NULL,
    time_complexity TEXT NOT NULL,
    space_complexity TEXT NOT NULL,
    practice_questions TEXT DEFAULT '[]',
    generated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content_version INT NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS practice_problems (
    id SERIAL PRIMARY KEY,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'LeetCode',
    external_url TEXT NOT NULL,
    difficulty VARCHAR(30) NOT NULL,
    problem_type VARCHAR(100) NOT NULL DEFAULT 'Core Algorithm'
);

-- Users table with complete authentication support (BCrypt password hash & role)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_STUDENT',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_topic_progress (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    theory_completed BOOLEAN NOT NULL DEFAULT FALSE,
    code_completed BOOLEAN NOT NULL DEFAULT FALSE,
    practice_completed_count INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_topic UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS practice_attempts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    practice_problem_id INT NOT NULL REFERENCES practice_problems(id) ON DELETE CASCADE,
    attempt_status VARCHAR(30) NOT NULL,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'SELF_REPORTED',
    attempted_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_topics_stage_id ON topics(stage_id);
CREATE INDEX IF NOT EXISTS idx_topic_videos_topic_id ON topic_videos(topic_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_practice_problems_topic_id ON practice_problems(topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_id ON user_topic_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_problem ON practice_attempts(user_id, practice_problem_id);
