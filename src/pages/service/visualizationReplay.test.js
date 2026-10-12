import { describe, expect, it } from "vitest";
import { replayPlan } from "./visualizationReplay";
import {
  buildBubbleSortPlan,
  buildLinkedListReversalPlan,
  buildStackPlan,
} from "./visualizationSamples";

describe("replayPlan", () => {
  it("gives one frame per step", () => {
    const plan = buildStackPlan();

    expect(replayPlan(plan)).toHaveLength(plan.steps.length);
  });

  it("swaps bar positions until they are sorted", () => {
    const frames = replayPlan(buildBubbleSortPlan([5, 1, 4, 2, 8]));
    const bars = [...frames.at(-1).objects].sort((a, b) => a.position[0] - b.position[0]);

    expect(bars.map((bar) => bar.value)).toEqual([1, 2, 4, 5, 8]);
    expect(bars.every((bar) => bar.state === "sorted")).toBe(true);
  });

  it("follows links, unlinks, adds and removes", () => {
    const frames = replayPlan(buildLinkedListReversalPlan([1, 2, 3]));
    const last = frames.at(-1);

    expect(last.relationships.map((link) => link.id)).toEqual([
      "reversed-1",
      "reversed-2",
      "reversed-3",
    ]);
    expect(last.objects.some((object) => object.id === "next")).toBe(false);
  });

  it("never changes an earlier frame", () => {
    const frames = replayPlan(buildBubbleSortPlan([2, 1]));
    const firstBar = frames[0].objects.find((object) => object.id === "bar-0");

    expect(firstBar.position).toEqual(buildBubbleSortPlan([2, 1]).scene.objects[0].position);
  });
});
