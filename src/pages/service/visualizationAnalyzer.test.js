import { describe, expect, it, vi } from "vitest";
import { analyzeTopicWithLLM } from "./visualizationAnalyzer";
import { buildStackPlan } from "./visualizationSamples";

const graphs = { id: "graphs", title: "Graphs" }; // has no sample plan
const stacks = { id: "stacks-queues", title: "Stacks & Queues" }; // has one

const goodReply = { text: JSON.stringify(buildStackPlan()), model: "fake-model" };

// A plan that parses fine but points at an object that doesn't exist.
function badReply() {
  const plan = buildStackPlan();
  plan.steps[1].actions.push({ type: "setState", targets: ["ghost"], state: "active" });
  return { text: JSON.stringify(plan), model: "fake-model" };
}

// A fake LLM that gives these replies in order. An Error is thrown instead.
function fakeModel(...replies) {
  return vi.fn(async () => {
    const reply = replies.shift();
    if (reply instanceof Error) throw reply;
    return reply;
  });
}

describe("analyzeTopicWithLLM", () => {
  it("returns a valid AI plan", async () => {
    const callModel = fakeModel(goodReply);

    const result = await analyzeTopicWithLLM(graphs, { callModel });

    expect(result).toMatchObject({ source: "ai", attempts: 1, errors: [] });
    expect(result.plan.topic).toBe("Graphs");
    expect(result.plan.metadata).toMatchObject({ source: "ai", model: "fake-model" });
    expect(callModel).toHaveBeenCalledTimes(1);
  });

  it("sends validator errors back so the model can repair its plan", async () => {
    const callModel = fakeModel(badReply(), goodReply);
    const onAttempt = vi.fn();

    const result = await analyzeTopicWithLLM(graphs, { callModel, onAttempt });

    expect(result).toMatchObject({ source: "ai", attempts: 2 });
    expect(onAttempt).toHaveBeenCalledTimes(1);

    const { userPrompt } = callModel.mock.calls[1][0];
    expect(userPrompt).toContain("YOUR PREVIOUS REPLY WAS REJECTED");
    expect(userPrompt).toContain('no object "ghost" exists at this step');
  });

  it("asks for a repair when the reply isn't JSON", async () => {
    const callModel = fakeModel({ text: "Sorry, I can't." }, goodReply);

    const result = await analyzeTopicWithLLM(graphs, { callModel });

    expect(result.attempts).toBe(2);
    expect(callModel.mock.calls[1][0].userPrompt).toContain(
      "The reply does not contain a JSON object.",
    );
  });

  it("falls back to the sample plan after 3 bad attempts", async () => {
    const callModel = fakeModel(badReply(), badReply(), badReply());

    const result = await analyzeTopicWithLLM(stacks, { callModel });

    expect(callModel).toHaveBeenCalledTimes(3);
    expect(result.source).toBe("sample");
    expect(result.plan.metadata.source).toBe("sample");
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("returns no plan when there is no sample to fall back to", async () => {
    const callModel = fakeModel(badReply(), badReply(), badReply());

    const result = await analyzeTopicWithLLM(graphs, { callModel });

    expect(result).toMatchObject({ plan: null, source: "none", attempts: 3 });
  });

  it("stops at once when the model can't be reached", async () => {
    const callModel = fakeModel(new Error("API key not valid"));

    const result = await analyzeTopicWithLLM(stacks, { callModel });

    expect(callModel).toHaveBeenCalledTimes(1);
    expect(result.source).toBe("sample");
    expect(result.errors).toEqual(["The AI could not be reached: API key not valid"]);
  });

  it("rejects a topic without a title", async () => {
    await expect(
      analyzeTopicWithLLM({ id: "x" }, { callModel: fakeModel() }),
    ).rejects.toThrow("A valid topic with a title is required.");
  });
});
