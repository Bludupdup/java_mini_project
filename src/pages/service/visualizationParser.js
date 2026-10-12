/**
 * Turns the LLM's reply text into a plan object.
 *
 * JSON mode makes Gemini reply with bare JSON, but models still sometimes
 * wrap it in ```json fences, add a sentence around it, or nest it under a
 * "plan" key. This copes with all three and never throws: problems come back
 * as an error message that can be sent to the model to fix.
 */

const FENCED = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;

const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Returns { plan, error }: exactly one of them is null. */
export function parsePlanReply(text) {
  if (typeof text !== "string" || text.trim() === "") {
    return { plan: null, error: "The reply was empty." };
  }

  let source = text.trim();
  const fenced = source.match(FENCED);

  if (fenced) source = fenced[1];

  // Ignore any chatter before the first "{" or after the last "}".
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");

  if (start === -1 || end < start) {
    return { plan: null, error: "The reply does not contain a JSON object." };
  }

  let plan;

  try {
    plan = JSON.parse(source.slice(start, end + 1));
  } catch (error) {
    return { plan: null, error: `The reply is not valid JSON (${error.message}).` };
  }

  // { "plan": { ...the real plan } } → the real plan.
  if (isRecord(plan.plan) && plan.scene === undefined) plan = plan.plan;

  return { plan, error: null };
}
