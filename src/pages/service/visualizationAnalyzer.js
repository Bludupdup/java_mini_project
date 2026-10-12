/**
 * Universal Visualization Analyzer
 *
 * Turns any topic into a validated visualization plan:
 *
 *   topic → prompt → LLM → parse → validate ──→ valid: done
 *                     ↑                  │
 *                     └─ repair prompt ←─┘ invalid (up to 3 attempts)
 *
 * If the LLM never produces a valid plan, or can't be reached at all,
 * topics with a hand-made sample plan fall back to it.
 *
 * The LLM call is passed in as `callModel`, so this file knows nothing about
 * Gemini or API keys: the server passes the real Gemini call, tests pass a fake.
 */

import { buildPlanPrompt, buildRepairPrompt, PROMPT_VERSION } from "./visualizationPrompt.js";
import { parsePlanReply } from "./visualizationParser.js";
import { samplePlanBuilders } from "./visualizationSamples.js";
import { validateVisualizationPlan } from "./visualizationValidator.js";

const DEFAULT_MAX_ATTEMPTS = 3;

/** The topic's built-in sample plan. `plan` is null when there is none. */
export function buildSampleVisualization(topic) {
  const buildSamplePlan = samplePlanBuilders[topic.id];

  if (!buildSamplePlan) {
    return { plan: null, errors: [`No sample visualization exists for "${topic.title}".`] };
  }

  const plan = {
    ...buildSamplePlan(),
    topic: topic.title,
    metadata: { source: "sample" },
  };
  const { valid, errors } = validateVisualizationPlan(plan);

  return { plan: valid ? plan : null, errors };
}

/**
 * callModel({ systemPrompt, userPrompt }) must resolve to { text, model }.
 * onAttempt({ attempt, errors }) is called after every rejected attempt.
 *
 * Resolves to { plan, source, attempts, errors }:
 *   source   "ai" (valid LLM plan), "sample" (fallback) or "none" (no plan)
 *   errors   why the LLM's plan was not used; empty when source is "ai"
 */
export async function analyzeTopicWithLLM(
  topic,
  { callModel, maxAttempts = DEFAULT_MAX_ATTEMPTS, onAttempt },
) {
  if (!topic || typeof topic.title !== "string" || topic.title.trim() === "") {
    throw new Error("A valid topic with a title is required.");
  }

  const { systemPrompt, userPrompt: firstPrompt } = buildPlanPrompt(topic);
  let userPrompt = firstPrompt;
  let errors = [];
  let attempts = 0;

  while (attempts < maxAttempts) {
    attempts += 1;

    let reply;

    try {
      reply = await callModel({ systemPrompt, userPrompt });
    } catch (error) {
      // Bad key, network down, timeout... A repair prompt can't fix those.
      errors = [`The AI could not be reached: ${error.message}`];
      break;
    }

    const parsed = parsePlanReply(reply.text);

    if (parsed.error) {
      errors = [parsed.error];
    } else {
      // The topic and metadata come from us, not from the model.
      const plan = {
        ...parsed.plan,
        topic: topic.title,
        metadata: {
          source: "ai",
          model: reply.model,
          attempts,
          promptVersion: PROMPT_VERSION,
        },
      };

      ({ errors } = validateVisualizationPlan(plan));

      if (errors.length === 0) {
        return { plan, source: "ai", attempts, errors };
      }
    }

    onAttempt?.({ attempt: attempts, errors });
    userPrompt = buildRepairPrompt(firstPrompt, reply.text, errors);
  }

  const sample = buildSampleVisualization(topic);

  return {
    plan: sample.plan,
    source: sample.plan ? "sample" : "none",
    attempts,
    errors,
  };
}
