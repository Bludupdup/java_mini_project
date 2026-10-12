import { topics } from "./topics";

export const PROBLEM_DIFFICULTIES = ["Easy", "Medium", "Hard"];

// "https://leetcode.com/problems/two-sum/" → "two-sum". The URL is unique and
// doesn't change, so solved marks and notes stay attached to the right problem.
function problemId(url) {
  return new URL(url).pathname.split("/").filter(Boolean).at(-1);
}

/** Every practice problem from every topic, with an id and its topic. */
export const problems = topics.flatMap((topic) =>
  topic.problems.map((problem) => ({
    ...problem,
    id: problemId(problem.url),
    topicId: topic.id,
    topicTitle: topic.title,
  })),
);

export const getTopicProblems = (topicId) =>
  problems.filter((problem) => problem.topicId === topicId);
