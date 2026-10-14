/**
 * Helpers for showing rows of the algorithms table. Plain functions, no
 * React, so they are easy to test.
 */

/**
 * The "working" column as a list of steps. Most rows number their steps one
 * per line ("1. Choose a starting city.\n2. ..."); a few are one paragraph,
 * which is split into sentences instead.
 */
export function splitSteps(text) {
  if (!text) return [];

  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length > 1) return lines.map((line) => line.replace(/^\d+[.)]\s*/, ""));

  return lines[0]
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

/** The first sentence, for short descriptions in lists. */
export function firstSentence(text) {
  if (!text) return "";

  const match = text.match(/^.*?\.(?=\s|$)/s);
  return match ? match[0] : text;
}

/**
 * Algorithms grouped by their topic, keeping the order they come in:
 * [{ topic: { id, title } | null, algorithms: [...] }].
 */
export function groupByTopic(algorithms) {
  const groups = new Map();

  for (const algorithm of algorithms) {
    const key = algorithm.topic?.id ?? "";

    if (!groups.has(key)) groups.set(key, { topic: algorithm.topic ?? null, algorithms: [] });
    groups.get(key).algorithms.push(algorithm);
  }

  return [...groups.values()];
}

/** "https://leetcode.com/problems/two-sum/" → "two-sum": the id practice problems use. */
export function problemIdFromUrl(url) {
  try {
    return new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? null;
  } catch {
    return null;
  }
}
