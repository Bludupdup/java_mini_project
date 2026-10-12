import { afterEach, describe, expect, it, vi } from "vitest";
import { createModelCaller, DEFAULT_OPENROUTER_MODELS } from "./llm.js";
import { callOpenRouter } from "./openrouter.js";

const options = {
  apiKey: "sk-or-test",
  models: ["vendor/model-a:free"],
  systemPrompt: "system",
  userPrompt: "user",
};

const respond = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const answer = (content, finishReason = "stop", model = "vendor/model-a:free") =>
  respond(200, {
    model,
    choices: [{ message: { content }, finish_reason: finishReason }],
    usage: { total_tokens: 42 },
  });

function fakeFetch(makeResponse) {
  const fetch = vi.fn(async () => makeResponse());
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("callOpenRouter", () => {
  it("sends the key, the messages and JSON mode, and returns the reply", async () => {
    const fetch = fakeFetch(() => answer('{"ok": true}'));

    const result = await callOpenRouter(options);

    expect(result).toEqual({
      text: '{"ok": true}',
      model: "vendor/model-a:free",
      usage: { total_tokens: 42 },
    });
    const [, init] = fetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(init.headers.Authorization).toBe("Bearer sk-or-test");
    expect(body).toMatchObject({
      model: "vendor/model-a:free",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "system" },
        { role: "user", content: "user" },
      ],
    });
  });

  it("sends a fallback list when given several models, and reports which answered", async () => {
    const fetch = fakeFetch(() => answer("{}", "stop", "vendor/model-b:free"));

    const result = await callOpenRouter({ ...options, models: ["a", "b"] });

    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({ models: ["a", "b"] });
    expect(result.model).toBe("vendor/model-b:free");
  });

  it("rejects a reply that was cut off", async () => {
    fakeFetch(() => answer('{"title": "Bub', "length"));

    await expect(callOpenRouter(options)).rejects.toThrow("stopped early (length)");
  });

  it("retries a busy model at most twice", async () => {
    vi.useFakeTimers();
    const fetch = fakeFetch(() => respond(503, { error: { message: "No provider available" } }));

    const result = expect(callOpenRouter(options)).rejects.toThrow("No provider available");
    await vi.runAllTimersAsync();
    await result;

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("explains the host's real error instead of 'Provider returned error'", async () => {
    vi.useFakeTimers();
    fakeFetch(() =>
      respond(429, {
        error: {
          message: "Provider returned error",
          metadata: { raw: "model-a:free is temporarily rate-limited upstream." },
        },
      }),
    );

    const result = expect(callOpenRouter(options)).rejects.toThrow("rate-limited upstream");
    await vi.runAllTimersAsync();
    await result;
  });

  it("doesn't retry once the free daily limit is used up", async () => {
    const fetch = fakeFetch(() =>
      respond(429, { error: { message: "Rate limit exceeded: free-models-per-day" } }),
    );

    await expect(callOpenRouter(options)).rejects.toThrow("used up");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("gives a clear message for a bad key, without retrying", async () => {
    const fetch = fakeFetch(() => respond(401, { error: { message: "No auth credentials found" } }));

    await expect(callOpenRouter(options)).rejects.toThrow("rejected the API key");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("reports a slow model as a timeout, without retrying", async () => {
    const fetch = fakeFetch(() => {
      throw new DOMException("Timed out", "TimeoutError");
    });

    await expect(callOpenRouter(options)).rejects.toThrow("didn't finish within 3 minutes");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("createModelCaller", () => {
  it("uses OpenRouter when its key is set, with the free models by default", () => {
    const llm = createModelCaller({ OPENROUTER_API_KEY: "sk-or-x", GEMINI_API_KEY: "g" });

    expect(llm.label).toBe(`OpenRouter (${DEFAULT_OPENROUTER_MODELS.join(", ")})`);
  });

  it("reads a comma-separated model list", () => {
    const llm = createModelCaller({ OPENROUTER_API_KEY: "k", OPENROUTER_MODEL: " a , b ,," });

    expect(llm.label).toBe("OpenRouter (a, b)");
  });

  it("falls back to Gemini without an OpenRouter key", () => {
    expect(createModelCaller({ GEMINI_API_KEY: "g" }).label).toBe("Gemini (gemini-3.8-flash)");
  });
});
