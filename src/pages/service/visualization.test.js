import { describe, expect, it } from "vitest";
import { buildBubbleSortPlan } from "./visualizationSamples";
import { validateVisualizationPlan } from "./visualizationValidator";

// The sample builders leave `topic` to the analyzer, but the validator requires it.
function bubbleSortPlan(values) {
  return { ...buildBubbleSortPlan(values), topic: "Bubble Sort" };
}

// Replays every swap and returns the bar values from left to right.
function valuesAfterReplay(plan) {
  const order = plan.scene.objects.map((object) => object.id);

  for (const step of plan.steps) {
    for (const action of step.actions) {
      if (action.type === "swap") {
        const [a, b] = action.targets.map((id) => order.indexOf(id));
        [order[a], order[b]] = [order[b], order[a]];
      }
    }
  }

  const valueOf = Object.fromEntries(
    plan.scene.objects.map((object) => [object.id, object.value]),
  );
  return order.map((id) => valueOf[id]);
}

describe("bubble sort visualization plan", () => {
  it("passes validation", () => {
    const result = validateVisualizationPlan(bubbleSortPlan([5, 1, 4, 2, 8]));

    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("is rejected when an action points at a missing object", () => {
    const plan = bubbleSortPlan([2, 1]);
    plan.steps[1].actions[0].targets = ["bar-0", "bar-9"];

    const result = validateVisualizationPlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'steps[1].actions[0].targets[1]: no object "bar-9" exists at this step',
    );
  });

  // Validation only proves the plan can be drawn. This proves it actually sorts.
  it("ends with the bars in sorted order", () => {
    const inputs = [[5, 1, 4, 2, 8], [3, 2, 1], [1, 2, 3], [4, 1, 4, 2]];

    for (const values of inputs) {
      const sorted = [...values].sort((a, b) => a - b);

      expect(valuesAfterReplay(bubbleSortPlan(values))).toEqual(sorted);
    }
  });
});
