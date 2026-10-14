/**
 * The topic catalog, as the pages use it. The backend sends topics as JSON
 * (GET /api/topics); this turns that into what the pages need:
 *   - icon names ("Brackets") become lucide-react components
 *   - one flat list of every practice problem, each knowing its topic
 * Plain functions, no React, so they are easy to test.
 */

import {
  ArrowUpDown,
  Backpack,
  BookOpen,
  Brackets,
  Coins,
  Columns3,
  Combine,
  Crosshair,
  Diff,
  GitMerge,
  Grid3x3,
  Hash,
  Layers,
  Link,
  ListOrdered,
  ListTree,
  Network,
  Route,
  Signpost,
  Triangle,
  Type,
  Undo2,
  Waypoints,
  Workflow,
  Zap,
} from "lucide-react";

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"];

// Icons the database may name. A topic with an unknown name gets BookOpen.
const ICONS = {
  ArrowUpDown,
  Backpack,
  BookOpen,
  Brackets,
  Coins,
  Columns3,
  Combine,
  Crosshair,
  Diff,
  GitMerge,
  Grid3x3,
  Hash,
  Layers,
  Link,
  ListOrdered,
  ListTree,
  Network,
  Route,
  Signpost,
  Triangle,
  Type,
  Undo2,
  Waypoints,
  Workflow,
  Zap,
};

/** { topics, problems, getTopic(id), getTopicProblems(topicId) } from the API's topic list. */
export function buildCatalog(apiTopics) {
  const topics = apiTopics.map((topic) => ({
    ...topic,
    icon: ICONS[topic.icon] ?? BookOpen,
  }));

  const problems = topics.flatMap((topic) =>
    topic.problems.map((problem) => ({
      ...problem,
      topicId: topic.id,
      topicTitle: topic.title,
    })),
  );

  return {
    topics,
    problems,
    getTopic: (id) => topics.find((topic) => topic.id === id),
    getTopicProblems: (topicId) => problems.filter((problem) => problem.topicId === topicId),
  };
}
