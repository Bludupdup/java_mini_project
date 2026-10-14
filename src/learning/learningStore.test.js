import { describe, expect, it } from "vitest";
import {
  computeBestStreak,
  computeStreak,
  emptyLearningState,
  findLegacyProgress,
  getLearningStats,
  getNextTopic,
  getTopicProgress,
  hasLearningData,
  learningReducer,
  removeLegacyProgress,
  sanitizeLearningState,
  STORAGE_KEY,
  toDayKey,
} from "./learningStore";

// Local-time noon, so day keys don't shift with the time zone.
const day = (date) => new Date(`${date}T12:00:00`).getTime();
const NOW = day("2026-10-11");

function run(...actions) {
  return actions.reduce(learningReducer, emptyLearningState());
}

describe("bookmarks", () => {
  it("toggles a topic on and off, newest first", () => {
    let state = run({ type: "toggleBookmark", id: "arrays" }, { type: "toggleBookmark", id: "graphs" });
    expect(state.bookmarks).toEqual(["graphs", "arrays"]);

    state = learningReducer(state, { type: "toggleBookmark", id: "arrays" });
    expect(state.bookmarks).toEqual(["graphs"]);
  });
});

describe("topic progress", () => {
  it("counts 10% for opening, up to 90% for watching, 100% for completing", () => {
    expect(getTopicProgress(undefined)).toEqual({ status: "not-started", percent: 0 });

    let state = run({ type: "visit", id: "arrays", now: NOW });
    expect(getTopicProgress(state.topics.arrays)).toEqual({ status: "in-progress", percent: 10 });

    state = learningReducer(state, { type: "recordStep", id: "arrays", step: 9, total: 10, now: NOW });
    expect(getTopicProgress(state.topics.arrays).percent).toBe(90);

    state = learningReducer(state, { type: "setCompleted", id: "arrays", completed: true, now: NOW });
    expect(getTopicProgress(state.topics.arrays)).toEqual({ status: "completed", percent: 100 });

    state = learningReducer(state, { type: "setCompleted", id: "arrays", completed: false, now: NOW });
    expect(getTopicProgress(state.topics.arrays).status).toBe("in-progress");
  });

  it("remembers the furthest step, not the latest one", () => {
    const state = run(
      { type: "recordStep", id: "graphs", step: 7, total: 12, now: NOW },
      { type: "recordStep", id: "graphs", step: 2, total: 12, now: NOW },
    );

    expect(state.topics.graphs.visualization).toEqual({ seen: 8, total: 12 });
  });

  it("starts over when a regenerated plan has a different length", () => {
    const state = run(
      { type: "recordStep", id: "graphs", step: 7, total: 12, now: NOW },
      { type: "recordStep", id: "graphs", step: 0, total: 20, now: NOW },
    );

    expect(state.topics.graphs.visualization).toEqual({ seen: 1, total: 20 });
  });

  it("returns the same state when nothing changed, so React can skip a render", () => {
    const state = run({ type: "recordStep", id: "graphs", step: 5, total: 12, now: NOW });

    expect(learningReducer(state, { type: "recordStep", id: "graphs", step: 3, total: 12, now: NOW })).toBe(state);
  });
});

describe("practice problems", () => {
  it("toggles solved, and solving counts as a study day", () => {
    let state = run({ type: "toggleSolved", id: "two-sum", now: NOW });

    expect(state.problems["two-sum"].solvedAt).toBe(NOW);
    expect(state.activityDays).toEqual(["2026-10-11"]);

    state = learningReducer(state, { type: "toggleSolved", id: "two-sum", now: day("2026-10-12") });
    expect(state.problems["two-sum"].solvedAt).toBeUndefined();
    expect(state.activityDays).toEqual(["2026-10-11"]);
  });

  it("keeps notes, and treats a blank note as no note", () => {
    let state = run({ type: "setNote", id: "two-sum", note: "Use a hash map." });
    expect(state.problems["two-sum"].note).toBe("Use a hash map.");

    expect(learningReducer(state, { type: "setNote", id: "two-sum", note: "Use a hash map." })).toBe(state);

    state = learningReducer(state, { type: "setNote", id: "two-sum", note: "   " });
    expect(state.problems["two-sum"].note).toBeUndefined();
  });
});

describe("achievements, notifications and preferences", () => {
  it("unlocks each achievement once, keeping the first unlock time", () => {
    let state = run({ type: "unlockAchievements", ids: ["finisher"], now: NOW });
    state = learningReducer(state, { type: "unlockAchievements", ids: ["finisher"], now: NOW + 5 });

    expect(state.achievements).toEqual({ finisher: NOW });
    expect(learningReducer(state, { type: "unlockAchievements", ids: [], now: NOW })).toBe(state);
  });

  it("marks notifications read and merges preference changes", () => {
    const state = run(
      { type: "markNotificationsRead", now: NOW },
      { type: "setPreferences", changes: { name: "Sam" } },
      { type: "setPreferences", changes: { playbackSpeed: "fast" } },
    );

    expect(state.notificationsSeenAt).toBe(NOW);
    expect(state.preferences).toEqual({ name: "Sam", playbackSpeed: "fast", reduceMotion: false });
  });
});

describe("resetting", () => {
  const busy = () =>
    run(
      { type: "toggleBookmark", id: "trees" },
      { type: "visit", id: "trees", now: NOW },
      { type: "toggleSolved", id: "two-sum", now: NOW },
      { type: "setNote", id: "two-sum", note: "Hash map" },
      { type: "toggleSolved", id: "coin-change", now: NOW },
      { type: "unlockAchievements", ids: ["first-steps"], now: NOW },
      { type: "setPreferences", changes: { name: "Sam" } },
    );

  it("reset progress keeps bookmarks, notes and preferences", () => {
    const state = learningReducer(busy(), { type: "resetProgress" });

    expect(state).toEqual({
      ...emptyLearningState(),
      bookmarks: ["trees"],
      problems: { "two-sum": { note: "Hash map" } },
      preferences: { name: "Sam", playbackSpeed: "normal", reduceMotion: false },
    });
  });

  it("reset everything clears it all", () => {
    expect(learningReducer(busy(), { type: "resetEverything" })).toEqual(emptyLearningState());
  });
});

describe("streaks", () => {
  it("counts days in a row ending today or yesterday", () => {
    const days = ["2026-10-07", "2026-10-09", "2026-10-10", "2026-10-11"];

    expect(computeStreak(days, NOW)).toBe(3);
    expect(computeStreak(days.slice(0, 3), NOW)).toBe(2); // nothing today yet
    expect(computeStreak(["2026-10-08"], NOW)).toBe(0);
  });

  it("finds the best streak ever, across month ends", () => {
    expect(computeBestStreak([])).toBe(0);
    expect(computeBestStreak(["2026-09-29", "2026-09-30", "2026-10-01", "2026-10-05"])).toBe(3);
  });

  it("records each active day once", () => {
    const state = run(
      { type: "visit", id: "arrays", now: day("2026-10-10") },
      { type: "visit", id: "strings", now: day("2026-10-11") },
      { type: "visit", id: "graphs", now: day("2026-10-11") },
    );

    expect(state.activityDays).toEqual(["2026-10-10", "2026-10-11"]);
    expect(toDayKey(NOW)).toBe("2026-10-11");
  });
});

describe("stats", () => {
  const topics = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const problems = [
    { id: "p1", difficulty: "Easy" },
    { id: "p2", difficulty: "Medium" },
  ];

  it("summarizes topics, problems and streaks", () => {
    const state = run(
      { type: "visit", id: "a", now: day("2026-10-10") },
      { type: "visit", id: "b", now: day("2026-10-11") },
      { type: "recordStep", id: "b", step: 3, total: 4, now: NOW },
      { type: "setCompleted", id: "b", completed: true, now: NOW },
      { type: "toggleSolved", id: "p2", now: NOW },
      { type: "toggleBookmark", id: "c" },
    );

    expect(getLearningStats(topics, problems, state, NOW)).toEqual({
      totalTopics: 3,
      explored: 2,
      completed: 1,
      percent: Math.round((10 + 100 + 0) / 3),
      fullVisualizations: 1,
      totalProblems: 2,
      solved: 1,
      solvedMedium: 1,
      saved: 1,
      streak: 2,
      bestStreak: 2,
      activeDays: 2,
    });
    // b is finished, so the last unfinished topic opened is a.
    expect(getNextTopic(topics, state).id).toBe("a");
  });
});

describe("reading data from the server or a file", () => {
  it("falls back to an empty state for missing data", () => {
    expect(sanitizeLearningState(null)).toEqual(emptyLearningState());
    expect(sanitizeLearningState("not an object")).toEqual(emptyLearningState());
  });

  it("drops anything that isn't valid", () => {
    const saved = {
      bookmarks: ["arrays", 42, "arrays"],
      topics: {
        arrays: { visitedAt: NOW, visualization: { seen: 50, total: 10 } },
        trees: "oops",
      },
      problems: { "two-sum": { solvedAt: "yesterday", note: "Hash map" }, "bad-one": {} },
      activityDays: ["2026-10-11", "yesterday"],
      achievements: { finisher: NOW, broken: "soon" },
      notificationsSeenAt: -1,
      preferences: { name: "Sam", playbackSpeed: "warp", reduceMotion: "yes" },
    };

    expect(sanitizeLearningState(saved)).toEqual({
      ...emptyLearningState(),
      bookmarks: ["arrays"],
      topics: { arrays: { visitedAt: NOW } },
      problems: { "two-sum": { note: "Hash map" } },
      activityDays: ["2026-10-11"],
      achievements: { finisher: NOW },
      preferences: { name: "Sam", playbackSpeed: "normal", reduceMotion: false },
    });
  });

  it("still reads data saved before practice and achievements existed", () => {
    const old = { bookmarks: ["graphs"], topics: {}, activityDays: [] };

    expect(sanitizeLearningState(old)).toEqual({ ...emptyLearningState(), bookmarks: ["graphs"] });
  });

  it("knows whether there is anything worth keeping", () => {
    expect(hasLearningData(emptyLearningState())).toBe(false);
    expect(hasLearningData({ ...emptyLearningState(), preferences: { name: "Sam" } })).toBe(false);
    expect(hasLearningData(run({ type: "toggleBookmark", id: "graphs" }))).toBe(true);
  });
});

describe("progress this browser saved before it moved to the server", () => {
  // Works like localStorage: length, key(i), getItem, removeItem.
  function memoryStorage(entries = {}) {
    const data = new Map(Object.entries(entries));
    return {
      get length() {
        return data.size;
      },
      key: (index) => [...data.keys()][index] ?? null,
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      removeItem: (key) => data.delete(key),
      data,
    };
  }

  const accountKey = (id) => `${STORAGE_KEY}:${id}`;

  it("finds a guest save or an old account's save", () => {
    const guest = memoryStorage({ [STORAGE_KEY]: '{"bookmarks":["graphs"]}' });
    const account = memoryStorage({ [accountKey("old-id")]: '{"bookmarks":["arrays"]}' });

    expect(findLegacyProgress(guest)).toEqual({
      keys: [STORAGE_KEY],
      state: { ...emptyLearningState(), bookmarks: ["graphs"] },
    });
    expect(findLegacyProgress(account).state.bookmarks).toEqual(["arrays"]);
  });

  it("ignores empty or broken saves and other apps' keys", () => {
    const storage = memoryStorage({
      [STORAGE_KEY]: "{not json",
      [accountKey("a")]: JSON.stringify(emptyLearningState()),
      [accountKey("b")]: '{"bookmarks":["trees"]}',
      "dsa-visualization:arrays": "{}",
    });
    const found = findLegacyProgress(storage);

    expect(found.state.bookmarks).toEqual(["trees"]);
    // All three old saves can go once it's moved; the visualization cache stays.
    expect(found.keys).toHaveLength(3);
    removeLegacyProgress(found.keys, storage);
    expect([...storage.data.keys()]).toEqual(["dsa-visualization:arrays"]);
  });

  it("moves nothing when it can't tell whose progress it is", () => {
    const storage = memoryStorage({
      [accountKey("a")]: '{"bookmarks":["trees"]}',
      [accountKey("b")]: '{"bookmarks":["graphs"]}',
    });

    expect(findLegacyProgress(storage)).toBeNull();
    expect(findLegacyProgress(memoryStorage())).toBeNull();
  });

  it("copes with storage that is blocked", () => {
    const blocked = {
      get length() {
        throw new Error("SecurityError");
      },
    };

    expect(findLegacyProgress(blocked)).toBeNull();
  });
});
