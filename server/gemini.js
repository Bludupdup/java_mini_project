/**
 * Gemini client (server side only).
 *
 * This file runs in Node, never in the browser, because it needs the API
 * key. Anything shipped to the browser can be read by whoever opens the
 * page, so the key stays on the server and the browser talks to us instead.
 *
 * API reference: https://ai.google.dev/api/generate-content
 */

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

// Most replies take 15–30 s, but now and then a request hangs for minutes.
// Give up after 90 s and send it again: the retry usually answers quickly.
const REQUEST_TIMEOUT_MS = 90_000;

// 429 = too many requests, 503 = model overloaded. Both usually clear up if
// we wait, so they are worth retrying, like timeouts. Anything else (bad key,
// bad request) would just fail the same way again.
const RETRYABLE_STATUSES = [429, 503];
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1_000;

export class GeminiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Rejects with error.name === "TimeoutError" if Gemini takes too long.
function post(url, apiKey, body) {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

/**
 * Sends one prompt to Gemini and returns its JSON reply as text.
 * Returns { text, model, usage }.
 */
export async function callGemini({ apiKey, model, systemPrompt, userPrompt }) {
  if (!apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not set. Add it to .env.local.");
  }

  const url = `${GEMINI_BASE_URL}/${model}:generateContent`;
  const body = {
    systemInstruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    generationConfig: {
      // Gemini must reply with JSON only: no markdown, no chatty intro.
      responseMimeType: "application/json",
      // Less thinking = much faster replies. Plenty for structured output.
      thinkingConfig: { thinkingLevel: "low" },
    },
  };

  // Each pass of the loop is one request. A timeout, 429 or 503 goes round
  // again, at most MAX_RETRIES times.
  for (let attempt = 0; ; attempt += 1) {
    const canRetry = attempt < MAX_RETRIES;
    let response;

    try {
      response = await post(url, apiKey, body);
    } catch (error) {
      if (error.name !== "TimeoutError") throw error;
      if (canRetry) continue;
      throw new GeminiError("Gemini did not answer within the time limit.");
    }

    // Busy or overloaded: wait 1s, then 2s (exponential backoff).
    if (RETRYABLE_STATUSES.includes(response.status) && canRetry) {
      await wait(RETRY_DELAY_MS * 2 ** attempt);
      continue;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new GeminiError(
        data.error?.message ?? `Gemini answered with status ${response.status}.`,
        response.status,
      );
    }

    const candidate = data.candidates?.[0];

    // No candidate at all means the prompt itself was blocked.
    if (!candidate) {
      const reason = data.promptFeedback?.blockReason ?? "unknown reason";
      throw new GeminiError(`Gemini refused the prompt (${reason}).`);
    }

    // STOP is the only normal ending. MAX_TOKENS means the reply was cut off;
    // SAFETY, RECITATION and OTHER mean it was blocked part-way through.
    if (candidate.finishReason !== "STOP") {
      throw new GeminiError(
        `Gemini stopped early (${candidate.finishReason}), so the reply is incomplete.`,
      );
    }

    const text = (candidate.content?.parts ?? [])
      .map((part) => part.text ?? "")
      .join("");

    return { text, model: data.modelVersion ?? model, usage: data.usageMetadata };
  }
}
