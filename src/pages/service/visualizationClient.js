/**
 * Browser side of the analyzer.
 *
 * Asks our own server, never Gemini directly (the key lives on the server),
 * and keeps good AI plans in localStorage so revisiting a topic doesn't
 * cost another slow LLM call.
 */

import { PROMPT_VERSION } from "./visualizationPrompt.js";
import { validateVisualizationPlan } from "./visualizationValidator.js";

const ENDPOINT = "/api/visualize";

// Only these fields are sent. Topics also hold a React icon component,
// which can't be turned into JSON.
const TOPIC_FIELDS = [
  "id",
  "title",
  "category",
  "description",
  "theory",
  "steps",
  "pseudocode",
];

// The prompt version is part of the key, so changing the prompt ignores old plans.
const cacheKey = (topic) => `dsa-visualization:v${PROMPT_VERSION}:${topic.id}`;

/** The saved AI plan for this topic, or null. */
export function readCachedVisualization(topic) {
  try {
    const result = JSON.parse(localStorage.getItem(cacheKey(topic)));

    // Saved data can be stale or edited by hand, so check it like any input.
    return result && validateVisualizationPlan(result.plan).valid ? result : null;
  } catch {
    return null;
  }
}

function saveVisualization(topic, result) {
  try {
    localStorage.setItem(cacheKey(topic), JSON.stringify(result));
  } catch {
    // Storage is full or blocked; the plan just won't be remembered.
  }
}

/** Asks the server for a fresh plan. Resolves to { plan, source, attempts, errors }. */
export async function requestVisualization(topic, { signal } = {}) {
  const payload = Object.fromEntries(
    TOPIC_FIELDS.filter((field) => topic[field] !== undefined).map((field) => [
      field,
      topic[field],
    ]),
  );

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: payload }),
    signal,
  });
  const result = await response.json().catch(() => null);

  if (!response.ok || !result) {
    throw new Error(
      result?.error ?? `The server answered with status ${response.status}.`,
    );
  }
  if (result.plan && !validateVisualizationPlan(result.plan).valid) {
    throw new Error("The server sent a plan that does not pass validation.");
  }

  // Only AI plans are worth saving: samples are instant, and failures
  // should be retried next time.
  if (result.source === "ai") saveVisualization(topic, result);

  return result;
}
