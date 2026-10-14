/**
 * Everything the learner has done and chosen: saved topics, progress per
 * topic, solved problems, achievements, active days and preferences.
 * Plain functions only; LearningProvider connects them to React and to the
 * backend, which keeps them in the database (see learningClient.js).
 *
 * State shape:
 * {
 *   bookmarks: ["graphs", "arrays"],            // newest first
 *   topics: {
 *     arrays: {
 *       visitedAt?: number,                     // last time its page was opened
 *       completedAt?: number,                   // when it was marked complete
 *       visualization?: { seen, total },        // furthest step reached, steps in the plan
 *     },
 *   },
 *   problems: { "two-sum": { solvedAt?: number, note?: string } },
 *   activityDays: ["2026-10-10", "2026-10-11"], // local dates with activity, oldest first
 *   achievements: { "first-steps": unlockedAt },
 *   notificationsSeenAt: number,                // notifications after this are unread
 *   preferences: { name, playbackSpeed, reduceMotion },
 * }
 *
 * Times come in through actions (action.now), so the reducer stays pure.
 */

// Where this browser kept progress before it moved to the server.
export const STORAGE_KEY = "dsa-universe:learning:v1";
const MAX_ACTIVITY_DAYS = 400;
export const MAX_NOTE_LENGTH = 2000;
export const MAX_NAME_LENGTH = 40;

// Milliseconds per step when a visualization plays by itself.
export const PLAYBACK_SPEEDS = { slow: 2400, normal: 1600, fast: 900 };

export const STATUS_LABELS = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

const defaultPreferences = () => ({ name: "", playbackSpeed: "normal", reduceMotion: false });

export const emptyLearningState = () => ({
  bookmarks: [],
  topics: {},
  problems: {},
  activityDays: [],
  achievements: {},
  notificationsSeenAt: 0,
  preferences: defaultPreferences(),
});

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isTime = (value) => Number.isFinite(value) && value > 0;
const isCount = (value) => Number.isInteger(value) && value >= 0;
const hasText = (value) => typeof value === "string" && value.trim() !== "";
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function cleanTopic(record) {
  const clean = {};
  const { visitedAt, completedAt, visualization } = record;

  if (isTime(visitedAt)) clean.visitedAt = visitedAt;
  if (isTime(completedAt)) clean.completedAt = completedAt;
  if (
    isRecord(visualization) &&
    isCount(visualization.seen) &&
    isCount(visualization.total) &&
    visualization.total > 0 &&
    visualization.seen <= visualization.total
  ) {
    clean.visualization = { seen: visualization.seen, total: visualization.total };
  }

  return clean;
}

function cleanProblem(record) {
  const clean = {};

  if (isTime(record.solvedAt)) clean.solvedAt = record.solvedAt;
  if (hasText(record.note)) clean.note = record.note.slice(0, MAX_NOTE_LENGTH);

  return clean;
}

/** Saved or imported data can be old, half-written or edited by hand: keep only what is valid. */
export function sanitizeLearningState(input) {
  const state = emptyLearningState();

  if (!isRecord(input)) return state;

  if (Array.isArray(input.bookmarks)) {
    state.bookmarks = [...new Set(input.bookmarks.filter((id) => typeof id === "string"))];
  }

  if (isRecord(input.topics)) {
    for (const [id, record] of Object.entries(input.topics)) {
      if (isRecord(record)) state.topics[id] = cleanTopic(record);
    }
  }

  if (isRecord(input.problems)) {
    for (const [id, record] of Object.entries(input.problems)) {
      const clean = isRecord(record) ? cleanProblem(record) : {};
      if (Object.keys(clean).length > 0) state.problems[id] = clean;
    }
  }

  if (Array.isArray(input.activityDays)) {
    const days = input.activityDays.filter(
      (day) => typeof day === "string" && DAY_PATTERN.test(day),
    );
    state.activityDays = [...new Set(days)].sort().slice(-MAX_ACTIVITY_DAYS);
  }

  if (isRecord(input.achievements)) {
    for (const [id, unlockedAt] of Object.entries(input.achievements)) {
      if (isTime(unlockedAt)) state.achievements[id] = unlockedAt;
    }
  }

  if (isTime(input.notificationsSeenAt)) state.notificationsSeenAt = input.notificationsSeenAt;

  if (isRecord(input.preferences)) {
    const { name, playbackSpeed, reduceMotion } = input.preferences;

    if (typeof name === "string") state.preferences.name = name.slice(0, MAX_NAME_LENGTH);
    if (Object.hasOwn(PLAYBACK_SPEEDS, playbackSpeed)) {
      state.preferences.playbackSpeed = playbackSpeed;
    }
    if (typeof reduceMotion === "boolean") state.preferences.reduceMotion = reduceMotion;
  }

  return state;
}

/** Has the learner done or chosen anything yet? (Preferences alone don't count.) */
export function hasLearningData(state) {
  return (
    state.bookmarks.length > 0 ||
    Object.keys(state.topics).length > 0 ||
    Object.keys(state.problems).length > 0 ||
    state.activityDays.length > 0 ||
    Object.keys(state.achievements).length > 0
  );
}

/**
 * Before progress lived on the server, this browser saved it under
 * STORAGE_KEY (as a guest) or `${STORAGE_KEY}:<old account id>`. If exactly
 * one of those saves holds anything, returns { keys, state } so it can be
 * moved into the account; otherwise null (nothing to move, or no way to tell
 * whose it is).
 */
export function findLegacyProgress(storage = globalThis.localStorage) {
  try {
    const keys = [];

    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key === STORAGE_KEY || key?.startsWith(`${STORAGE_KEY}:`)) keys.push(key);
    }

    const saves = keys
      .map((key) => {
        try {
          return sanitizeLearningState(JSON.parse(storage.getItem(key)));
        } catch {
          return emptyLearningState();
        }
      })
      .filter(hasLearningData);

    return saves.length === 1 ? { keys, state: saves[0] } : null;
  } catch {
    // Storage is blocked (private mode, browser settings).
    return null;
  }
}

/** Deletes the old browser saves once they are safely on the server. */
export function removeLegacyProgress(keys, storage = globalThis.localStorage) {
  try {
    for (const key of keys) storage.removeItem(key);
  } catch {
    // Nothing to do: they will just be found (and skipped) again.
  }
}

/** "2026-10-11": the local calendar date of a time or Date. */
export function toDayKey(time) {
  const date = new Date(time);
  const pad = (number) => String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function addActivityDay(days, now) {
  const today = toDayKey(now);

  return days.at(-1) === today ? days : [...days, today].slice(-MAX_ACTIVITY_DAYS);
}

function updateTopic(state, id, changes, now) {
  return {
    ...state,
    topics: { ...state.topics, [id]: { ...state.topics[id], ...changes } },
    activityDays: addActivityDay(state.activityDays, now),
  };
}

export function learningReducer(state, action) {
  switch (action.type) {
    case "toggleBookmark": {
      const saved = state.bookmarks.includes(action.id);

      return {
        ...state,
        bookmarks: saved
          ? state.bookmarks.filter((id) => id !== action.id)
          : [action.id, ...state.bookmarks],
      };
    }

    case "visit":
      return updateTopic(state, action.id, { visitedAt: action.now }, action.now);

    case "setCompleted":
      return updateTopic(
        state,
        action.id,
        { completedAt: action.completed ? action.now : undefined },
        action.now,
      );

    case "recordStep": {
      const { id, step, total, now } = action;
      const previous = state.topics[id]?.visualization;
      // A regenerated plan with a different number of steps starts over.
      const seenBefore = previous?.total === total ? previous.seen : 0;
      const seen = Math.min(total, Math.max(seenBefore, step + 1));

      // Nothing new: return the same object so React skips the re-render.
      if (previous?.total === total && previous.seen === seen) return state;

      return updateTopic(state, id, { visualization: { seen, total } }, now);
    }

    case "toggleSolved": {
      const record = state.problems[action.id] ?? {};
      const solvedAt = record.solvedAt ? undefined : action.now;

      return {
        ...state,
        problems: { ...state.problems, [action.id]: { ...record, solvedAt } },
        // Solving counts as studying today; undoing a mistake doesn't.
        activityDays: solvedAt
          ? addActivityDay(state.activityDays, action.now)
          : state.activityDays,
      };
    }

    case "setNote": {
      const note = action.note.slice(0, MAX_NOTE_LENGTH);
      const record = state.problems[action.id] ?? {};

      if ((record.note ?? "") === note) return state;

      return {
        ...state,
        problems: {
          ...state.problems,
          [action.id]: { ...record, note: hasText(note) ? note : undefined },
        },
      };
    }

    case "unlockAchievements": {
      const fresh = action.ids.filter((id) => !state.achievements[id]);

      if (fresh.length === 0) return state;

      return {
        ...state,
        achievements: {
          ...state.achievements,
          ...Object.fromEntries(fresh.map((id) => [id, action.now])),
        },
      };
    }

    case "markNotificationsRead":
      return { ...state, notificationsSeenAt: action.now };

    case "setPreferences":
      return { ...state, preferences: { ...state.preferences, ...action.changes } };

    case "resetProgress":
      // Keep what the learner chose or wrote: saved topics, notes and preferences.
      return {
        ...emptyLearningState(),
        bookmarks: state.bookmarks,
        preferences: state.preferences,
        problems: Object.fromEntries(
          Object.entries(state.problems)
            .filter(([, record]) => record.note)
            .map(([id, record]) => [id, { note: record.note }]),
        ),
      };

    case "resetEverything":
      return emptyLearningState();

    case "replace":
      return action.state;

    default:
      return state;
  }
}

/**
 * Opening a topic counts 10%, watching its visualization up to 80% more,
 * and marking it complete makes it 100%.
 */
export function getTopicProgress(record) {
  if (record?.completedAt) return { status: "completed", percent: 100 };
  if (!record?.visitedAt && !record?.visualization) {
    return { status: "not-started", percent: 0 };
  }

  const { seen = 0, total = 1 } = record.visualization ?? {};

  return { status: "in-progress", percent: Math.round(10 + 80 * (seen / total)) };
}

/** Days in a row with activity, ending today (or yesterday, if today has none yet). */
export function computeStreak(activityDays, now) {
  const days = new Set(activityDays);
  const date = new Date(now);

  if (!days.has(toDayKey(date))) date.setDate(date.getDate() - 1);

  let streak = 0;

  while (days.has(toDayKey(date))) {
    streak += 1;
    date.setDate(date.getDate() - 1);
  }

  return streak;
}

function nextDayKey(day) {
  const date = new Date(`${day}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return toDayKey(date);
}

/** The longest run of days in a row, ever. */
export function computeBestStreak(activityDays) {
  let best = 0;
  let run = 0;
  let previous = null;

  for (const day of [...activityDays].sort()) {
    run = previous && nextDayKey(previous) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  return best;
}

/** The numbers behind the dashboard, the progress page and achievements. */
export function getLearningStats(topics, problems, state, now) {
  const progress = topics.map((topic) => getTopicProgress(state.topics[topic.id]));
  const percentSum = progress.reduce((sum, { percent }) => sum + percent, 0);
  const solved = problems.filter((problem) => state.problems[problem.id]?.solvedAt);
  const fullVisualizations = topics.filter((topic) => {
    const visualization = state.topics[topic.id]?.visualization;
    return visualization && visualization.seen === visualization.total;
  });

  return {
    totalTopics: topics.length,
    explored: progress.filter(({ status }) => status !== "not-started").length,
    completed: progress.filter(({ status }) => status === "completed").length,
    percent: topics.length === 0 ? 0 : Math.round(percentSum / topics.length),
    fullVisualizations: fullVisualizations.length,
    totalProblems: problems.length,
    solved: solved.length,
    solvedMedium: solved.filter(({ difficulty }) => difficulty !== "Easy").length,
    saved: state.bookmarks.length,
    streak: computeStreak(state.activityDays, now),
    bestStreak: computeBestStreak(state.activityDays),
    activeDays: state.activityDays.length,
  };
}

/** The topic to continue: the last one opened but not finished, else the first unfinished one. */
export function getNextTopic(topics, state) {
  const unfinished = topics.filter((topic) => !state.topics[topic.id]?.completedAt);
  const visitedAt = (topic) => state.topics[topic.id]?.visitedAt ?? 0;
  const lastOpened = unfinished
    .filter((topic) => visitedAt(topic) > 0)
    .sort((a, b) => visitedAt(b) - visitedAt(a))[0];

  return lastOpened ?? unfinished[0] ?? topics[0];
}

/** The saved topics, newest first, skipping ids that no longer exist. */
export function getSavedTopics(topics, state) {
  return state.bookmarks
    .map((id) => topics.find((topic) => topic.id === id))
    .filter(Boolean);
}
