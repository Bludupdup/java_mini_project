-- ============================================================================
-- The algorithm library: the "algorithms" table from the team's database dump
-- (codepath_backup.sql, owner atharva). Same columns, plus topic_id: the topic
-- each algorithm belongs to. Filled by R__seed_catalog_algorithms.sql.
--
-- That dump's users, user_progress and submissions tables were empty, and this
-- database already has its own (users, topic_progress, ...), so they are not
-- copied.
-- ============================================================================

CREATE TABLE algorithms (
    id                  BIGSERIAL    PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    slug                VARCHAR(100) NOT NULL UNIQUE,  -- used in URLs: /algorithms/merge-sort
    topic_id            BIGINT       REFERENCES topics (id) ON DELETE SET NULL,
    display_order       INT          NOT NULL,
    description         TEXT         NOT NULL,
    working             TEXT,                          -- the steps, one per line
    example             TEXT,
    cpp_code            TEXT,
    output              TEXT,                          -- what cpp_code prints
    recurrence          TEXT,
    best_complexity     VARCHAR(50),
    average_complexity  VARCHAR(50),
    worst_complexity    VARCHAR(50),
    space_complexity    VARCHAR(50),
    applications        TEXT,
    advantages          TEXT,
    disadvantages       TEXT,
    youtube_url         TEXT,
    leetcode_title      VARCHAR(200),
    leetcode_url        TEXT,
    leetcode_difficulty VARCHAR(10)  CHECK (leetcode_difficulty IN ('Easy', 'Medium', 'Hard'))
);

CREATE INDEX idx_algorithms_topic ON algorithms (topic_id);
