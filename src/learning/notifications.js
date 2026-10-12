import { ACHIEVEMENTS } from "./achievements";
import { plural } from "./format";
import { computeStreak, getNextTopic, toDayKey } from "./learningStore";

const MAX_ACHIEVEMENT_ITEMS = 8;

/**
 * What the bell shows, newest first:
 *   { id, kind: "tip" | "streak" | "achievement", title, text, to, time }
 * Tips and streak reminders have no time; they describe right now.
 */
export function getNotifications(state, topics, now) {
  const items = [];
  const streak = computeStreak(state.activityDays, now);
  const studiedToday = state.activityDays.at(-1) === toDayKey(now);

  if (state.activityDays.length === 0) {
    items.push({
      id: "welcome",
      kind: "tip",
      title: "Welcome to DSA Universe!",
      text: `Start with ${topics[0].title} and watch its AI visualization.`,
      to: `/topics/${topics[0].id}`,
      time: null,
    });
  } else if (streak > 0 && !studiedToday) {
    const next = getNextTopic(topics, state);

    items.push({
      id: "streak",
      kind: "streak",
      title: `Keep your ${plural(streak, "day")} streak going`,
      text: `Study something today, like ${next.title}.`,
      to: `/topics/${next.id}`,
      time: null,
    });
  }

  ACHIEVEMENTS.filter((achievement) => state.achievements[achievement.id])
    .sort((a, b) => state.achievements[b.id] - state.achievements[a.id])
    .slice(0, MAX_ACHIEVEMENT_ITEMS)
    .forEach((achievement) => {
      items.push({
        id: achievement.id,
        kind: "achievement",
        title: `Achievement unlocked: ${achievement.title}`,
        text: achievement.description,
        to: "/achievements",
        time: state.achievements[achievement.id],
      });
    });

  return items;
}

/** How many unlocks the learner hasn't seen in the bell yet. */
export function countUnread(state) {
  return Object.values(state.achievements).filter(
    (unlockedAt) => unlockedAt > state.notificationsSeenAt,
  ).length;
}
