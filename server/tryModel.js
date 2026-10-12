/**
 * Quick check that the AI key and model work (OpenRouter or Gemini, the same
 * choice the app makes):
 *   npm run ai:try
 */
import { createModelCaller } from "./llm.js";

const llm = createModelCaller(process.env);
const started = Date.now();

console.log(`Asking ${llm.label}...`);

const { text, model, usage } = await llm.callModel({
  systemPrompt: "You are a friendly DSA tutor. Reply with JSON only.",
  userPrompt:
    'Explain arrays in one sentence. Reply as {"topic": string, "sentence": string}.',
});

const seconds = ((Date.now() - started) / 1000).toFixed(1);
const tokens = usage?.total_tokens ?? usage?.totalTokenCount;

console.log(`${model} answered in ${seconds}s using ${tokens} tokens:`);
console.log(JSON.parse(text));
