/**
 * Searching and filtering topics. Plain functions, no React, so they are
 * easy to test and the header, the topics page and the dashboard all agree.
 */

export const DIFFICULTY_LEVELS = ["Beginner", "Intermediate", "Advanced"];

// Where a word can match, and how much a match there is worth.
// A word in the title matters far more than one buried in the theory.
const SEARCH_FIELDS = [
  ["title", 10],
  ["structures", 6],
  ["category", 4],
  ["level", 3],
  ["description", 3],
  ["steps", 1],
  ["theory", 1],
  ["pseudocode", 1],
];

const normalize = (text) => text.toLowerCase().trim();

function fieldText(topic, field) {
  const value = topic[field];
  if (Array.isArray(value)) return normalize(value.join(" "));
  return typeof value === "string" ? normalize(value) : "";
}

// Every word must match somewhere; each word scores its best field.
function scoreTopic(topic, words) {
  let total = 0;

  for (const word of words) {
    let best = 0;

    for (const [field, weight] of SEARCH_FIELDS) {
      if (weight > best && fieldText(topic, field).includes(word)) best = weight;
    }

    if (best === 0) return 0;
    total += best;
  }

  return total;
}

/** Topics matching the query, best match first. An empty query returns them all. */
export function searchTopics(topics, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);

  if (words.length === 0) return topics;

  return topics
    .map((topic) => ({ topic, score: scoreTopic(topic, words) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ topic }) => topic);
}

/** The choices for each filter, built from the topics themselves. */
export function getFilterOptions(topics) {
  const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));

  return {
    categories: unique(topics.map((topic) => topic.category)),
    levels: DIFFICULTY_LEVELS.filter((level) =>
      topics.some((topic) => topic.level === level),
    ),
    structures: unique(topics.flatMap((topic) => topic.structures ?? [])),
  };
}

/**
 * filters: { category, level, structure, savedOnly }. Empty values mean "any".
 * savedIds: the bookmarked topic ids, used by savedOnly.
 */
export function filterTopics(topics, filters, savedIds = []) {
  const { category, level, structure, savedOnly } = filters;

  return topics.filter(
    (topic) =>
      (!category || topic.category === category) &&
      (!level || topic.level === level) &&
      (!structure || (topic.structures ?? []).includes(structure)) &&
      (!savedOnly || savedIds.includes(topic.id)),
  );
}
