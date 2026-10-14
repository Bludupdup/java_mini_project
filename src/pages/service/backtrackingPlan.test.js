import { describe, expect, it } from "vitest";
import { buildSampleVisualization } from "./visualizationAnalyzer";
import { replayPlan } from "./visualizationReplay";
import { buildSubsetsBacktrackingPlan, builtInFirstTopics } from "./visualizationSamples";
import { validateVisualizationPlan } from "./visualizationValidator";

const plan = (items) => ({ ...buildSubsetsBacktrackingPlan(items), topic: "Backtracking" });
const calls = (frame) => frame.objects.filter((object) => object.id.startsWith("call-"));
const results = (frame) => frame.objects.filter((object) => object.id.startsWith("result-"));
const pathText = (frame) => frame.objects.find((object) => object.id.startsWith("path-")).label;

describe("backtracking (subsets) visualization plan", () => {
  it("passes validation", () => {
    expect(validateVisualizationPlan(plan(["a", "b", "c"]))).toEqual({ valid: true, errors: [] });
  });

  // Validation only proves it can be drawn. These prove it shows the real algorithm.
  it("records every subset exactly once, in the order the recursion finds them", () => {
    const frames = replayPlan(plan(["a", "b", "c"]));
    const last = frames.at(-1);

    expect(results(last).map((box) => box.label)).toEqual(["∅", "c", "b", "bc", "a", "ac", "ab", "abc"]);
    expect(results(replayPlan(plan(["x", "y"])).at(-1)).map((box) => box.label)).toEqual(["∅", "y", "x", "xy"]);
  });

  it("draws the whole call tree without overlaps, inside the scene", () => {
    const last = replayPlan(plan(["a", "b", "c"])).at(-1);
    const nodes = calls(last);
    const spots = new Set(nodes.map(({ position: [x, y] }) => `${x.toFixed(2)},${y.toFixed(2)}`));

    expect(nodes).toHaveLength(15); // 1 + 2 + 4 + 8 calls
    expect(spots.size).toBe(15);
    expect(last.relationships).toHaveLength(14); // one edge into every call but the root
    for (const object of last.objects) {
      expect(object.position.every((value) => Math.abs(value) <= 8), object.id).toBe(true);
    }
    // Each recorded subset sits right under its leaf.
    for (const box of results(last)) {
      const leaf = nodes.find((node) => node.label === box.label && node.state === "found");
      expect(box.position[0]).toBeCloseTo(leaf.position[0]);
    }
  });

  it("keeps the path label in step with the call being worked on", () => {
    for (const frame of replayPlan(plan(["a", "b", "c"]))) {
      const active = calls(frame).filter((node) => node.state === "active");

      expect(active.length).toBeLessThanOrEqual(1);
      if (active.length === 1) {
        const subset = active[0].label === "∅" ? [] : [...active[0].label];
        expect(pathText(frame)).toBe(`path = [${subset.join(", ")}]`);
      }
    }
  });

  it("is shown straight away for the Backtracking topic", () => {
    const { plan: built, errors } = buildSampleVisualization({ id: "backtracking", title: "Backtracking" });

    expect(builtInFirstTopics.has("backtracking")).toBe(true);
    expect(errors).toEqual([]);
    expect(built.steps.length).toBeGreaterThan(20);
  });
});
