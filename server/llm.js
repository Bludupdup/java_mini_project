/**
 * Picks which AI service builds the visualization plans, from .env.local:
 * OpenRouter when OPENROUTER_API_KEY is set, otherwise Gemini.
 *
 * Returns { label, callModel }. The analyzer only ever sees callModel, so
 * switching services never touches it.
 */

import { callGemini } from "./gemini.js";
import { callOpenRouter } from "./openrouter.js";

// Free models, best first. When one is busy, OpenRouter moves on to the next.
// Override with OPENROUTER_MODEL in .env.local (one id, or several separated by commas).
export const DEFAULT_OPENROUTER_MODELS = [
  "nvidia/nemotron-3-super-120b-a12b:free",
  "apodex/apodex-1.1-mini:free",
  "dots-studio/dots-3-note-preview:free",
];
export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";

export function createModelCaller(env) {
  if (env.OPENROUTER_API_KEY) {
    const listed = (env.OPENROUTER_MODEL ?? "")
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);
    const models = listed.length > 0 ? listed : DEFAULT_OPENROUTER_MODELS;

    return {
      label: `OpenRouter (${models.join(", ")})`,
      callModel: ({ systemPrompt, userPrompt }) =>
        callOpenRouter({ apiKey: env.OPENROUTER_API_KEY, models, systemPrompt, userPrompt }),
    };
  }

  const model = env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;

  return {
    label: `Gemini (${model})`,
    callModel: ({ systemPrompt, userPrompt }) =>
      callGemini({ apiKey: env.GEMINI_API_KEY, model, systemPrompt, userPrompt }),
  };
}
