/**
 * OpenRouter client (server side only).
 *
 * OpenRouter is one API in front of hundreds of models from many companies,
 * using OpenAI's "chat completions" format. Same job as gemini.js: send one
 * prompt, get JSON text back.
 *
 * API reference: https://openrouter.ai/docs/api-reference/chat-completion
 */

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// Free models write slowly: a big plan can take a minute or two. A request
// that runs out of time isn't retried, because the retry would be just as slow
// (and every request counts towards the free daily limit).
const REQUEST_TIMEOUT_MS = 180_000;

// 408 timeout, 429 too many requests, 502 the model's host failed,
// 503 no host available right now. These usually pass if we wait a moment.
const RETRYABLE_STATUSES = [408, 429, 502, 503];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2_000;

// Endings that mean the reply is unusable: cut off, filtered, or failed.
const BAD_FINISH_REASONS = ["length", "content_filter", "error"];

export class OpenRouterError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "OpenRouterError";
    this.status = status;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Rejects with error.name === "TimeoutError" if the model takes too long.
function post(apiKey, body) {
  return fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      // Optional: names the app on OpenRouter's dashboard.
      "X-Title": "DSA Universe",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

// The free plan allows a fixed number of requests per day; retrying won't help.
const isDailyLimit = (error) => /per-day|per day|daily/i.test(error?.message ?? "");

function describeError(status, error) {
  if (status === 401) return "OpenRouter rejected the API key. Check OPENROUTER_API_KEY in .env.local.";
  if (status === 402) {
    return "This OpenRouter account has no credits for that model. Pick a model ending in :free, or add credits.";
  }
  if (status === 429 && isDailyLimit(error)) {
    return "Today's free OpenRouter requests are used up. They reset at midnight UTC.";
  }
  // "Provider returned error" is vague; the model host's own words are in metadata.raw.
  return error?.metadata?.raw ?? error?.message ?? `OpenRouter answered with status ${status}.`;
}

/**
 * Sends one prompt and returns the model's JSON reply as text.
 * models: one or more model ids. With several, OpenRouter tries them in order
 * and moves on when one is down or busy, which free models often are.
 * Returns { text, model, usage }, where model is the one that answered.
 */
export async function callOpenRouter({ apiKey, models, systemPrompt, userPrompt }) {
  if (!apiKey) {
    throw new OpenRouterError("OPENROUTER_API_KEY is not set. Add it to .env.local.");
  }

  const body = {
    ...(models.length > 1 ? { models } : { model: models[0] }),
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    // Ask for bare JSON. A model that can't do this just ignores it, and the
    // parser copes with whatever comes back.
    response_format: { type: "json_object" },
    // "Thinking" models reason before they answer. A little is enough for a
    // plan and much faster; models that don't think ignore this.
    reasoning: { effort: "low" },
  };

  // Each pass of the loop is one request. A retryable status goes round
  // again, at most MAX_RETRIES times.
  for (let attempt = 0; ; attempt += 1) {
    const canRetry = attempt < MAX_RETRIES;
    let response;
    let data;

    try {
      response = await post(apiKey, body);
      // The time limit covers reading the reply too: OpenRouter sends the
      // headers straight away, but the body only once the model has finished.
      data = await response.json();
    } catch (error) {
      if (error.name === "TimeoutError") {
        throw new OpenRouterError(
          "The model didn't finish within 3 minutes. Try again, or pick a faster model.",
        );
      }
      if (error instanceof SyntaxError) {
        throw new OpenRouterError(
          `OpenRouter sent a reply that isn't JSON (status ${response.status}).`,
          response.status,
        );
      }
      throw error;
    }

    if (RETRYABLE_STATUSES.includes(response.status) && canRetry && !isDailyLimit(data.error)) {
      // Busy: wait 2 s, then 4 s (exponential backoff).
      await wait(RETRY_DELAY_MS * 2 ** attempt);
      continue;
    }

    if (!response.ok || data.error) {
      throw new OpenRouterError(describeError(response.status, data.error), response.status);
    }

    const choice = data.choices?.[0];

    if (!choice) throw new OpenRouterError("The model sent no answer.");
    if (BAD_FINISH_REASONS.includes(choice.finish_reason)) {
      throw new OpenRouterError(
        `The model stopped early (${choice.finish_reason}), so the reply is incomplete.`,
      );
    }

    return { text: choice.message?.content ?? "", model: data.model ?? models[0], usage: data.usage };
  }
}
