/**
 * Prompts for the universal analyzer.
 *
 * The system prompt teaches the LLM the plan format, which is exactly what
 * visualizationValidator.js accepts. The lists of object types and states
 * come from the validator itself, and the examples are real plans from the
 * sample builders, so the prompt can never drift away from what passes.
 */

import {
  buildBubbleSortPlan,
  buildLinkedListReversalPlan,
} from "./visualizationSamples.js";
import { OBJECT_STATES, OBJECT_TYPES } from "./visualizationValidator.js";

// Bump this whenever the prompt changes, so plans cached from an older
// prompt are ignored instead of reused.
export const PROMPT_VERSION = 1;

// Enough to fix a plan; a broken plan can produce hundreds of errors.
const MAX_REPORTED_ERRORS = 25;
// A reply longer than this is not worth repeating back to the model.
const MAX_ECHOED_REPLY_CHARS = 60_000;

export const OBJECT_TYPE_GUIDE = {
  bar: 'an array value drawn as a bar. Needs "value" (a number), which sets its height.',
  box: "an array cell, stack or queue item, hash bucket, or table cell.",
  node: "a tree, graph or linked-list node.",
  pointer:
    "an index or pointer variable such as i, j, low, high, top or curr. Move it to show where it points.",
  label: 'plain text such as "null", "target = 7" or a short heading.',
};

export const STATE_GUIDE = {
  idle: "the default; nothing is happening to it",
  active: "being worked on right now",
  compare: "being compared",
  swap: "about to be swapped",
  sorted: "in its final place",
  found: "the answer or result",
  visited: "already processed",
};

const EXAMPLES = [
  { name: "Bubble sort on [3, 1, 2]", plan: buildBubbleSortPlan([3, 1, 2]) },
  {
    name: "Reversing the linked list 1 → 2",
    plan: buildLinkedListReversalPlan([1, 2]),
  },
];

const bulletList = (guide, keys) =>
  keys.map((key) => `- ${key}: ${guide[key]}`).join("\n");

const SYSTEM_PROMPT = `You design step-by-step animations that teach data structures and algorithms to beginners.
Reply with ONE JSON object, a "visualization plan", and nothing else.

PLAN SHAPE
{
  "title": string,
  "scene": {
    "type": "3d",
    "objects": [Object],              // everything on screen before the first step
    "relationships": [Relationship]   // arrows between objects
  },
  "steps": [{ "id": "step-1", "description": string, "actions": [Action] }]
}
Object       = { "id": string, "type": ObjectType, "label": string, "value"?: number, "position": [x, y, z], "state"?: State }
Relationship = { "id": string, "from": objectId, "to": objectId, "label"?: string }

ACTIONS (run in order within a step; a step may have no actions)
{ "type": "setState", "targets": [objectId, ...], "state": State }
{ "type": "swap", "targets": [objectIdA, objectIdB] }   // the two objects trade positions
{ "type": "move", "target": objectId, "position": [x, y, z] }
{ "type": "add", "object": Object }
{ "type": "remove", "target": objectId }                 // unlink its relationships first
{ "type": "link", "relationship": Relationship }
{ "type": "unlink", "target": relationshipId }

OBJECT TYPES
${bulletList(OBJECT_TYPE_GUIDE, OBJECT_TYPES)}

STATES (shown as colours)
${bulletList(STATE_GUIDE, OBJECT_STATES)}

RULES
1. Choose one small, concrete example (3 to 7 items) that shows the topic's core idea, and simulate it exactly. Every comparison, swap, pointer move and result must be correct for those values.
2. One idea per step, between 6 and 40 steps. Each description is one or two short, friendly sentences that mention the actual values.
3. Every id is unique. Step ids are "step-1", "step-2", ... in order.
4. An action may only use objects and relationships that exist at that moment: the initial scene, plus earlier "add" and "link", minus earlier "remove" and "unlink".
5. Layout: x grows to the right, y grows upwards, z is always 0. Put a row of items 1.4 apart, centred on x = 0. Put pointers 1.3 below the item they point at. Stack vertical structures 1.1 apart. Draw trees top-down with the root at y = 3 and each level 1.6 lower. Keep every coordinate between -8 and 8.
6. Highlights are temporary: set objects back to "idle" when they stop being compared or worked on.
7. Every bar needs a numeric "value". Use plain JSON numbers, never strings.
8. Keep the scene readable: at most 40 objects on screen at once.

EXAMPLES (they show the format only; design your own plan for the requested topic)
${EXAMPLES.map(({ name, plan }) => `${name}:\n${JSON.stringify(plan)}`).join("\n\n")}`;

// Topic fields worth telling the model about, in the order it reads them.
function describeTopic(topic) {
  const sections = [
    `TOPIC: ${topic.title}${topic.category ? ` (${topic.category})` : ""}`,
  ];

  if (topic.description) sections.push(`SUMMARY: ${topic.description}`);
  if (topic.theory) sections.push(`THEORY: ${topic.theory}`);
  if (topic.steps?.length) {
    sections.push(`HOW IT WORKS:\n${topic.steps.map((step) => `- ${step}`).join("\n")}`);
  }
  if (topic.pseudocode) sections.push(`PSEUDOCODE:\n${topic.pseudocode}`);

  return sections.join("\n\n");
}

/** The first request for a topic. */
export function buildPlanPrompt(topic) {
  return {
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `${describeTopic(topic)}\n\nCreate the visualization plan for this topic.`,
  };
}

/**
 * The follow-up request after a rejected reply: the original request, what
 * was wrong, and the reply itself, so the model can correct its own work.
 */
export function buildRepairPrompt(originalPrompt, previousReply, errors) {
  const shown = errors.slice(0, MAX_REPORTED_ERRORS).map((error) => `- ${error}`);
  const hidden = errors.length - shown.length;

  if (hidden > 0) shown.push(`- ...and ${hidden} more`);

  const reply =
    previousReply.length > MAX_ECHOED_REPLY_CHARS
      ? "(too long to repeat here; start again with fewer steps)"
      : previousReply;

  return `${originalPrompt}

YOUR PREVIOUS REPLY WAS REJECTED. Problems found:
${shown.join("\n")}

Your previous reply:
${reply}

Reply with the complete corrected plan as JSON. Fix every problem above and keep everything that was already right.`;
}
