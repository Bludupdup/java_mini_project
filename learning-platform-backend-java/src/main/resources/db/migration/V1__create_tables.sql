-- ============================================================================
-- DSA Universe - PostgreSQL schema.
--
-- Flyway runs each V<number>__*.sql file once, in order, and records it in the
-- flyway_schema_history table. Never edit this file after it has run on a
-- database: put changes in a new file (V2__..., V3__...) instead.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Catalog: what there is to learn. Filled by R__seed_catalog.sql.
-- ---------------------------------------------------------------------------

CREATE TABLE topics (
    id           BIGSERIAL    PRIMARY KEY,
    slug         VARCHAR(80)  NOT NULL UNIQUE,  -- used in URLs: /topics/arrays
    title        VARCHAR(120) NOT NULL,
    category     VARCHAR(80)  NOT NULL,
    description  TEXT         NOT NULL,
    level        VARCHAR(20)  NOT NULL CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
    lesson_count INT          NOT NULL CHECK (lesson_count >= 0),
    read_time    VARCHAR(40)  NOT NULL,
    icon         VARCHAR(40)  NOT NULL,         -- a lucide-react icon name, e.g. 'Brackets'
    color        VARCHAR(20)  NOT NULL,
    theory       TEXT         NOT NULL,
    tip          TEXT         NOT NULL,
    pseudocode   TEXT         NOT NULL,
    sort_order   INT          NOT NULL
);

-- Ordered lists that belong to one topic. (topic_id, position) is the key:
-- position 0 is the first item.
CREATE TABLE topic_structures (
    topic_id BIGINT      NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    position INT         NOT NULL,
    name     VARCHAR(60) NOT NULL,
    PRIMARY KEY (topic_id, position)
);

CREATE TABLE topic_steps (
    topic_id BIGINT NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    position INT    NOT NULL,
    content  TEXT   NOT NULL,
    PRIMARY KEY (topic_id, position)
);

CREATE TABLE topic_complexities (
    topic_id BIGINT       NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    position INT          NOT NULL,
    label    VARCHAR(80)  NOT NULL,
    value    VARCHAR(40)  NOT NULL,
    note     VARCHAR(200) NOT NULL,
    PRIMARY KEY (topic_id, position)
);

CREATE TABLE topic_resources (
    topic_id BIGINT       NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    position INT          NOT NULL,
    title    VARCHAR(200) NOT NULL,
    source   VARCHAR(80)  NOT NULL,
    url      TEXT         NOT NULL,
    PRIMARY KEY (topic_id, position)
);

CREATE TABLE practice_problems (
    id         BIGSERIAL    PRIMARY KEY,
    topic_id   BIGINT       NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    slug       VARCHAR(120) NOT NULL UNIQUE,     -- from the URL: 'two-sum'
    title      VARCHAR(200) NOT NULL,
    platform   VARCHAR(40)  NOT NULL,
    difficulty VARCHAR(10)  NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    url        TEXT         NOT NULL,
    position   INT          NOT NULL
);

CREATE INDEX idx_practice_problems_topic ON practice_problems (topic_id);

-- ---------------------------------------------------------------------------
-- Accounts
-- ---------------------------------------------------------------------------

CREATE TABLE users (
    id            BIGSERIAL    PRIMARY KEY,
    name          VARCHAR(40)  NOT NULL,
    email         VARCHAR(254) NOT NULL UNIQUE,  -- always stored trimmed and lower-case
    password_hash VARCHAR(100) NOT NULL,         -- BCrypt, never the password itself
    role          VARCHAR(20)  NOT NULL DEFAULT 'STUDENT',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Learning data: what each user has done and chosen.
-- Deleting a user deletes all of it (ON DELETE CASCADE).
-- ---------------------------------------------------------------------------

CREATE TABLE user_preferences (
    user_id               BIGINT      PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    display_name          VARCHAR(40) NOT NULL DEFAULT '',
    playback_speed        VARCHAR(10) NOT NULL DEFAULT 'normal'
                          CHECK (playback_speed IN ('slow', 'normal', 'fast')),
    reduce_motion         BOOLEAN     NOT NULL DEFAULT FALSE,
    notifications_seen_at TIMESTAMPTZ           -- notifications after this are unread
);

CREATE TABLE topic_progress (
    id           BIGSERIAL   PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    topic_id     BIGINT      NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    visited_at   TIMESTAMPTZ,                  -- last time the topic page was opened
    completed_at TIMESTAMPTZ,                  -- set when marked complete
    steps_seen   INT,                          -- furthest visualization step reached
    steps_total  INT,                          -- steps in that visualization
    UNIQUE (user_id, topic_id),
    CHECK ((steps_seen IS NULL) = (steps_total IS NULL)),
    CHECK (steps_total IS NULL OR (steps_total > 0 AND steps_seen BETWEEN 0 AND steps_total))
);

CREATE TABLE bookmarks (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    topic_id   BIGINT      NOT NULL REFERENCES topics (id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, topic_id)
);

CREATE TABLE problem_progress (
    id         BIGSERIAL   PRIMARY KEY,
    user_id    BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    problem_id BIGINT      NOT NULL REFERENCES practice_problems (id) ON DELETE CASCADE,
    solved_at  TIMESTAMPTZ,
    note       TEXT        CHECK (char_length(note) <= 2000),
    UNIQUE (user_id, problem_id)
);

-- Local calendar days on which the user studied, for streaks.
CREATE TABLE activity_days (
    id      BIGSERIAL PRIMARY KEY,
    user_id BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    day     DATE      NOT NULL,
    UNIQUE (user_id, day)
);

CREATE TABLE user_achievements (
    id             BIGSERIAL   PRIMARY KEY,
    user_id        BIGINT      NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    achievement_id VARCHAR(60) NOT NULL,       -- defined in the frontend: 'first-steps', ...
    unlocked_at    TIMESTAMPTZ NOT NULL,
    UNIQUE (user_id, achievement_id)
);
