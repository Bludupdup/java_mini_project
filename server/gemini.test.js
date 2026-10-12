import { afterEach, describe, expect, it, vi } from "vitest";
import { callGemini } from "./gemini.js";

const options = {
  apiKey: "test-key",
  model: "test-model",
  systemPrompt: "system",
  userPrompt: "user",
};

const respond = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const answer = (text, finishReason = "STOP") =>
  respond(200, {
    candidates: [{ content: { parts: [{ text }] }, finishReason }],
    modelVersion: "test-model-001",
  });

// Each call gets a fresh Response: a body can only be read once.
function fakeFetch(makeResponse) {
  const fetch = vi.fn(async () => makeResponse());
  vi.stubGlobal("fetch", fetch);
  return fetch;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("callGemini", () => {
  it("sends the key in a header and returns the reply text", async () => {
    const fetch = fakeFetch(() => answer('{"ok": true}'));

    const result = await callGemini(options);

    expect(result).toMatchObject({ text: '{"ok": true}', model: "test-model-001" });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toMatch(/\/test-model:generateContent$/);
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
  });

  it("rejects a reply that was cut off", async () => {
    fakeFetch(() => answer('{"title": "Bub', "MAX_TOKENS"));

    await expect(callGemini(options)).rejects.toThrow("Gemini stopped early (MAX_TOKENS)");
  });

  it("retries an overloaded model at most twice", async () => {
    vi.useFakeTimers();
    const fetch = fakeFetch(() => respond(503, { error: { message: "Model overloaded" } }));

    const result = expect(callGemini(options)).rejects.toThrow("Model overloaded");
    await vi.runAllTimersAsync();
    await result;

    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("sends a request again when it times out", async () => {
    let calls = 0;
    const fetch = fakeFetch(() => {
      calls += 1;
      if (calls === 1) throw new DOMException("Timed out", "TimeoutError");
      return answer('{"ok": true}');
    });

    await expect(callGemini(options)).resolves.toMatchObject({ text: '{"ok": true}' });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("gives up after three timeouts", async () => {
    const fetch = fakeFetch(() => {
      throw new DOMException("Timed out", "TimeoutError");
    });

    await expect(callGemini(options)).rejects.toThrow("did not answer within the time limit");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry a bad request", async () => {
    const fetch = fakeFetch(() => respond(400, { error: { message: "API key not valid" } }));

    await expect(callGemini(options)).rejects.toThrow("API key not valid");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("fails fast without a key", async () => {
    const fetch = fakeFetch(() => answer("{}"));

    await expect(callGemini({ ...options, apiKey: "" })).rejects.toThrow(
      "GEMINI_API_KEY is not set",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
});
