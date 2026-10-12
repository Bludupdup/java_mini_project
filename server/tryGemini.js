/**
 * Quick check that the key and model work:
 *   npm run gemini:try
 */
import { callGemini } from "./gemini.js";

const started = Date.now();

const { text, model, usage } = await callGemini({
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL ?? "gemini-3.8-flash",
  systemPrompt: "You are a friendly DSA tutor. Reply with JSON only.",
  userPrompt:
    'Explain arrays in one sentence. Reply as {"topic": string, "sentence": string}.',
});

const seconds = ((Date.now() - started) / 1000).toFixed(1);

console.log(`${model} answered in ${seconds}s using ${usage?.totalTokenCount} tokens:`);
console.log(JSON.parse(text));
