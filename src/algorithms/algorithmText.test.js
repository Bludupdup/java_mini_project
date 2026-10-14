import { describe, expect, it } from "vitest";
import fixture from "../test/algorithmsFixture.json";
import { firstSentence, groupByTopic, problemIdFromUrl, splitSteps } from "./algorithmText";

const byId = (id) => fixture.algorithms.find((algorithm) => algorithm.slug === id);

describe("splitSteps", () => {
  it("turns numbered lines into steps without their numbers", () => {
    expect(splitSteps("1. Pick a pivot.\n2. Partition.\n\n3. Recurse.")).toEqual([
      "Pick a pivot.",
      "Partition.",
      "Recurse.",
    ]);
  });

  it("splits a single paragraph into sentences", () => {
    expect(splitSteps("Sort the edges. Add the smallest one. Stop at V - 1 edges.")).toEqual([
      "Sort the edges.",
      "Add the smallest one.",
      "Stop at V - 1 edges.",
    ]);
  });

  it("handles every algorithm in the table", () => {
    for (const algorithm of fixture.algorithms) {
      const steps = splitSteps(algorithm.working);

      expect(steps.length, algorithm.slug).toBeGreaterThanOrEqual(1);
      expect(steps.every((step) => !/^\d+\./.test(step)), algorithm.slug).toBe(true);
    }
    expect(splitSteps(byId("n-queen-problem").working)).toHaveLength(9);
  });

  it("copes with a missing value", () => {
    expect(splitSteps(null)).toEqual([]);
  });
});

describe("firstSentence", () => {
  it("keeps only the first sentence", () => {
    expect(firstSentence(byId("prims-algorithm").description)).toBe(
      "Prim's Algorithm is a greedy algorithm used to find the Minimum Spanning Tree (MST) of a connected, weighted, undirected graph.",
    );
    expect(firstSentence("No full stop here")).toBe("No full stop here");
  });
});

describe("groupByTopic", () => {
  it("groups algorithms under their topic, in order", () => {
    const algorithms = [
      { id: "a", topic: { id: "strings", title: "Strings" } },
      { id: "b", topic: { id: "strings", title: "Strings" } },
      { id: "c", topic: null },
      { id: "d", topic: { id: "graphs", title: "Graphs" } },
    ];

    expect(groupByTopic(algorithms).map(({ topic, algorithms: list }) => [topic?.id ?? null, list.map((a) => a.id)])).toEqual([
      ["strings", ["a", "b"]],
      [null, ["c"]],
      ["graphs", ["d"]],
    ]);
  });
});

describe("problemIdFromUrl", () => {
  it("takes the problem's id from its LeetCode URL", () => {
    expect(problemIdFromUrl("https://leetcode.com/problems/network-delay-time/")).toBe("network-delay-time");
    expect(problemIdFromUrl("not a url")).toBeNull();
  });
});
