import {
  BookmarkPlus,
  CircleCheckBig,
  Clapperboard,
  Code2,
  Compass,
  Eye,
  Flame,
  Footprints,
  GraduationCap,
  Milestone,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

/**
 * Badges earned from learning stats (see getLearningStats). Each goal returns
 * [current, target]. Once earned, an achievement is saved with the time it
 * unlocked, so it stays unlocked even if a streak breaks later.
 */
export const ACHIEVEMENTS = [
  {
    id: "first-steps",
    title: "First steps",
    description: "Open your first topic.",
    icon: Footprints,
    color: "purple",
    goal: (stats) => [stats.explored, 1],
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Open every topic at least once.",
    icon: Compass,
    color: "blue",
    goal: (stats) => [stats.explored, stats.totalTopics],
  },
  {
    id: "finisher",
    title: "Finisher",
    description: "Mark your first topic as complete.",
    icon: CircleCheckBig,
    color: "green",
    goal: (stats) => [stats.completed, 1],
  },
  {
    id: "halfway",
    title: "Halfway there",
    description: "Complete half of all topics.",
    icon: Milestone,
    color: "orange",
    goal: (stats) => [stats.completed, Math.ceil(stats.totalTopics / 2)],
  },
  {
    id: "graduate",
    title: "DSA graduate",
    description: "Complete every topic.",
    icon: GraduationCap,
    color: "pink",
    goal: (stats) => [stats.completed, stats.totalTopics],
  },
  {
    id: "visual-learner",
    title: "Visual learner",
    description: "Watch a visualization to its very last step.",
    icon: Eye,
    color: "blue",
    goal: (stats) => [stats.fullVisualizations, 1],
  },
  {
    id: "binge-watcher",
    title: "Binge watcher",
    description: "Watch 5 visualizations to the end.",
    icon: Clapperboard,
    color: "purple",
    goal: (stats) => [stats.fullVisualizations, 5],
  },
  {
    id: "problem-solver",
    title: "Problem solver",
    description: "Solve your first practice problem.",
    icon: Code2,
    color: "green",
    goal: (stats) => [stats.solved, 1],
  },
  {
    id: "level-up",
    title: "Level up",
    description: "Solve a Medium problem.",
    icon: TrendingUp,
    color: "orange",
    goal: (stats) => [stats.solvedMedium, 1],
  },
  {
    id: "ten-down",
    title: "Ten down",
    description: "Solve 10 practice problems.",
    icon: Target,
    color: "pink",
    goal: (stats) => [stats.solved, 10],
  },
  {
    id: "collector",
    title: "Collector",
    description: "Save 3 topics for later.",
    icon: BookmarkPlus,
    color: "blue",
    goal: (stats) => [stats.saved, 3],
  },
  {
    id: "on-a-roll",
    title: "On a roll",
    description: "Study 3 days in a row.",
    icon: Flame,
    color: "orange",
    goal: (stats) => [stats.bestStreak, 3],
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Study 7 days in a row.",
    icon: Zap,
    color: "purple",
    goal: (stats) => [stats.bestStreak, 7],
  },
];

/**
 * Every achievement with its progress:
 * { ...achievement, current, target, unlocked, unlockedAt }
 */
export function evaluateAchievements(stats, unlockedAt = {}) {
  return ACHIEVEMENTS.map((achievement) => {
    const [current, target] = achievement.goal(stats);
    const earned = target > 0 && current >= target;
    const savedAt = unlockedAt[achievement.id] ?? null;

    return {
      ...achievement,
      current: Math.min(current, target),
      target,
      unlocked: earned || savedAt !== null,
      unlockedAt: savedAt,
    };
  });
}

/** Ids of achievements earned now that haven't been saved as unlocked yet. */
export function findNewAchievements(stats, unlockedAt) {
  return evaluateAchievements(stats, unlockedAt)
    .filter((achievement) => achievement.unlocked && achievement.unlockedAt === null)
    .map((achievement) => achievement.id);
}
