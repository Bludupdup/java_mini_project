/**
 * POST /api/visualize — the browser's only way to reach the analyzer.
 *
 * The browser sends a topic; this runs the analyzer here in Node, where the
 * AI key lives, and sends back { plan, source, attempts, errors }. Only
 * logged-in users may call it, so nobody else who can reach the server can
 * spend the AI key. Logins live in the Java backend, so getRequestUser (from
 * backendAuth.js) asks it.
 *
 * createVisualizeHandler is a plain (req, res) handler: the production server
 * (prodServer.js) uses it directly, and visualizeApi wraps it as a Vite plugin
 * for the dev server (`npm run dev`) and the preview server (`npm run preview`).
 */

import { analyzeTopicWithLLM } from "../src/pages/service/visualizationAnalyzer.js";
import { BackendUnavailableError } from "./backendAuth.js";
import { BadRequestError, isRecord, readJsonBody, sendJson } from "./http.js";

// Longest accepted value for each text field of a topic.
const TEXT_LIMITS = {
  id: 80,
  title: 120,
  category: 80,
  description: 600,
  theory: 3_000,
  pseudocode: 3_000,
};
const MAX_STEPS = 12;
const MAX_STEP_LENGTH = 300;

// Whatever the browser sends is untrusted: keep only known fields, check
// their types and cap their length, because all of it goes into the prompt.
function readTopic(input) {
  if (!isRecord(input)) throw new BadRequestError('"topic" must be an object.');

  const topic = {};

  for (const [field, limit] of Object.entries(TEXT_LIMITS)) {
    const value = input[field];

    if (value === undefined) continue;
    if (typeof value !== "string") {
      throw new BadRequestError(`"topic.${field}" must be a string.`);
    }
    if (value.length > limit) {
      throw new BadRequestError(`"topic.${field}" is longer than ${limit} characters.`);
    }
    topic[field] = value.trim();
  }

  if (!topic.title) throw new BadRequestError('"topic.title" is required.');

  if (input.steps !== undefined) {
    const valid =
      Array.isArray(input.steps) &&
      input.steps.length <= MAX_STEPS &&
      input.steps.every(
        (step) => typeof step === "string" && step.length <= MAX_STEP_LENGTH,
      );

    if (!valid) {
      throw new BadRequestError(
        `"topic.steps" must be at most ${MAX_STEPS} strings of up to ${MAX_STEP_LENGTH} characters.`,
      );
    }
    topic.steps = input.steps;
  }

  return topic;
}

/**
 * llm: { label, callModel } from llm.js, so this route works with any AI service.
 * getRequestUser: (req) → the logged-in user or null, from backendAuth.js.
 */
export function createVisualizeHandler({ llm, getRequestUser }) {
  const { callModel } = llm;

  // Requests for the same topic that arrive while one is already running
  // (a double click, two tabs) share it instead of paying for a second call.
  const running = new Map();

  function analyze(topic) {
    const key = JSON.stringify(topic);
    let job = running.get(key);

    if (!job) {
      const started = Date.now();
      const log = (message) => console.log(`[visualize] ${topic.title}: ${message}`);

      log(`asking ${llm.label}...`);
      job = analyzeTopicWithLLM(topic, {
        callModel,
        onAttempt: ({ attempt, errors }) =>
          log(`attempt ${attempt} rejected (${errors.length} problems), e.g. ${errors[0]}`),
      })
        .then((result) => {
          const seconds = ((Date.now() - started) / 1000).toFixed(1);

          log(`${result.source} plan after ${result.attempts} attempt(s) in ${seconds}s`);
          return result;
        })
        .finally(() => running.delete(key));
      running.set(key, job);
    }

    return job;
  }

  async function handle(req, res) {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "Use POST." });
      return;
    }

    try {
      if (!(await getRequestUser(req))) {
        sendJson(res, 401, { error: "Please log in to generate visualizations." });
        return;
      }

      const body = await readJsonBody(req);
      const topic = readTopic(isRecord(body) ? body.topic : undefined);

      sendJson(res, 200, await analyze(topic));
    } catch (error) {
      if (error instanceof BadRequestError) {
        sendJson(res, error.status, { error: error.message });
        return;
      }

      if (error instanceof BackendUnavailableError) {
        console.error("[visualize]", error.message);
        sendJson(res, 503, { error: "Can't reach the backend server to check your login. Is it running?" });
        return;
      }

      console.error("[visualize]", error);
      sendJson(res, 500, { error: "Something went wrong while building the visualization." });
    }
  }

  return handle;
}

/** The same route as a Vite plugin, for `npm run dev` and `npm run preview`. */
export function visualizeApi(options) {
  const handle = createVisualizeHandler(options);
  const addRoute = (server) => {
    server.middlewares.use("/api/visualize", handle);
  };

  return {
    name: "visualize-api",
    configureServer: addRoute,
    configurePreviewServer: addRoute,
  };
}
