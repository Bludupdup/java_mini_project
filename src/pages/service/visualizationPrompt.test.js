import { describe, expect, it } from "vitest";
import {
  buildPlanPrompt,
  buildRepairPrompt,
  OBJECT_TYPE_GUIDE,
  STATE_GUIDE,
} from "./visualizationPrompt";
import { ACTION_TYPES, OBJECT_STATES, OBJECT_TYPES } from "./visualizationValidator";

const topic = {
  id: "graphs",
  title: "Graphs",
  category: "Data Structures",
  description: "Vertices joined by edges.",
  steps: ["Start at a vertex.", "Visit its neighbours."],
  pseudocode: "bfs(graph, start)",
};

describe("plan prompt", () => {
  // If the validator gains a new type, state or action, the prompt must teach it too.
  it("covers everything the validator accepts", () => {
    const { systemPrompt } = buildPlanPrompt(topic);

    expect(Object.keys(OBJECT_TYPE_GUIDE).sort()).toEqual([...OBJECT_TYPES].sort());
    expect(Object.keys(STATE_GUIDE).sort()).toEqual([...OBJECT_STATES].sort());
    for (const action of ACTION_TYPES) {
      expect(systemPrompt).toContain(`"type": "${action}"`);
    }
  });

  it("describes the topic", () => {
    const { userPrompt } = buildPlanPrompt(topic);

    expect(userPrompt).toContain("TOPIC: Graphs (Data Structures)");
    expect(userPrompt).toContain("- Visit its neighbours.");
    expect(userPrompt).toContain("bfs(graph, start)");
  });

  it("repeats the reply and its errors when asking for a repair", () => {
    const errors = Array.from({ length: 30 }, (_, index) => `problem ${index + 1}`);
    const prompt = buildRepairPrompt("ORIGINAL", '{"title": "bad"}', errors);

    expect(prompt).toContain("ORIGINAL");
    expect(prompt).toContain('{"title": "bad"}');
    expect(prompt).toContain("- problem 25");
    expect(prompt).not.toContain("- problem 26");
    expect(prompt).toContain("...and 5 more");
  });
});
