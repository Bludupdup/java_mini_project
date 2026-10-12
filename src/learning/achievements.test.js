import { describe, expect, it } from "vitest";
import { getTopicProblems, problems } from "../data/problems";
import { topics } from "../data/topics";
import { ACHIEVEMENTS, evaluateAchievements, findNewAchievements } from "./achievements";
import { getInitials, timeAgo } from "./format";
import { emptyLearningState, getLearningStats, learningReducer } from "./learningStore";
import { countUnread, getNotifications } from "./notifications";

const NOW = new Date("2026-10-11T12:00:00").getTime();
const stats = (state) => getLearningStats(topics, problems, state, NOW);
const run = (...actions) => actions.reduce(learningReducer, emptyLearningState());

describe("achievements", () => {
  it("has unique ids", () => {
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("shows progress towards each goal", () => {
    const state = run(
      { type: "toggleBookmark", id: "arrays" },
      { type: "toggleBookmark", id: "graphs" },
    );
    const collector = evaluateAchievements(stats(state)).find((a) => a.id === "collector");

    expect(collector).toMatchObject({ current: 2, target: 3, unlocked: false, unlockedAt: null });
  });

  it("finds newly earned achievements and stops once they are saved", () => {
    let state = run(
      { type: "visit", id: "arrays", now: NOW },
      { type: "setCompleted", id: "arrays", completed: true, now: NOW },
      { type: "toggleSolved", id: "coin-change", now: NOW },
    );
    const earned = findNewAchievements(stats(state), state.achievements);

    expect(earned).toEqual(["first-steps", "finisher", "problem-solver", "level-up"]);

    state = learningReducer(state, { type: "unlockAchievements", ids: earned, now: NOW });
    expect(findNewAchievements(stats(state), state.achievements)).toEqual([]);
  });

  it("stays unlocked after the goal drops below target", () => {
    const state = run({ type: "unlockAchievements", ids: ["collector"], now: NOW });
    const collector = evaluateAchievements(stats(state), state.achievements).find(
      (a) => a.id === "collector",
    );

    expect(collector).toMatchObject({ unlocked: true, unlockedAt: NOW, current: 0 });
  });
});

describe("notifications", () => {
  it("welcomes a brand new learner", () => {
    expect(getNotifications(emptyLearningState(), topics, NOW)[0]).toMatchObject({
      kind: "tip",
      to: "/topics/arrays",
    });
  });

  it("reminds about a streak that ends today, and lists unlocks newest first", () => {
    const yesterday = new Date("2026-10-10T12:00:00").getTime();
    const state = run(
      { type: "visit", id: "arrays", now: yesterday },
      { type: "unlockAchievements", ids: ["first-steps"], now: yesterday },
      { type: "unlockAchievements", ids: ["finisher"], now: yesterday + 1000 },
    );

    expect(getNotifications(state, topics, NOW).map((item) => item.id)).toEqual([
      "streak",
      "finisher",
      "first-steps",
    ]);
  });

  it("counts unlocks after the last time the bell was opened", () => {
    let state = run({ type: "unlockAchievements", ids: ["first-steps"], now: NOW });
    expect(countUnread(state)).toBe(1);

    state = learningReducer(state, { type: "markNotificationsRead", now: NOW + 1 });
    expect(countUnread(state)).toBe(0);
  });
});

describe("helpers and data", () => {
  it("formats times and initials", () => {
    expect(timeAgo(NOW - 30_000, NOW)).toBe("just now");
    expect(timeAgo(NOW - 5 * 60_000, NOW)).toBe("5 min ago");
    expect(timeAgo(NOW - 3 * 3_600_000, NOW)).toBe("3 h ago");
    expect(timeAgo(NOW - 26 * 3_600_000, NOW)).toBe("yesterday");
    expect(getInitials("  ada   lovelace king ")).toBe("AL");
    expect(getInitials("")).toBe("");
  });

  it("gives every practice problem a unique id and a topic", () => {
    const ids = problems.map((problem) => problem.id);

    expect(new Set(ids).size).toBe(ids.length);
    expect(problems.find((problem) => problem.id === "two-sum").topicId).toBe("arrays");
    expect(getTopicProblems("graphs")).toHaveLength(3);
  });
});
