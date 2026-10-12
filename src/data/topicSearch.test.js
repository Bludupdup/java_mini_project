import { describe, expect, it } from "vitest";
import { topics } from "./topics";
import { filterTopics, getFilterOptions, searchTopics } from "./topicSearch";

const ids = (list) => list.map((topic) => topic.id);

describe("searchTopics", () => {
  it("returns every topic for an empty query", () => {
    expect(searchTopics(topics, "   ")).toBe(topics);
  });

  it("finds algorithms mentioned only in a topic's content", () => {
    expect(ids(searchTopics(topics, "bfs"))).toContain("graphs");
    expect(ids(searchTopics(topics, "palindrome"))).toContain("strings");
  });

  it("puts title matches first", () => {
    expect(ids(searchTopics(topics, "sort"))[0]).toBe("bubble-sort");
    expect(ids(searchTopics(topics, "TREE"))[0]).toBe("trees");
  });

  it("needs every word to match", () => {
    expect(ids(searchTopics(topics, "queue graph"))).toEqual(["graphs"]);
    expect(searchTopics(topics, "graph zebra")).toEqual([]);
  });
});

describe("filters", () => {
  it("builds the choices from the topics", () => {
    const options = getFilterOptions(topics);

    expect(options.levels).toEqual(["Beginner", "Intermediate", "Advanced"]);
    expect(options.categories).toContain("Sorting Algorithms");
    expect(options.structures).toContain("Hash Table");
  });

  it("combines category, difficulty and data structure", () => {
    const result = filterTopics(topics, {
      category: "Data Structures",
      level: "Beginner",
      structure: "Array",
    });

    expect(ids(result)).toEqual(["arrays"]);
  });

  it("shows only saved topics when asked", () => {
    const result = filterTopics(topics, { savedOnly: true }, ["graphs", "hashing"]);

    expect(ids(result)).toEqual(["hashing", "graphs"]);
  });

  it("treats empty filters as 'any'", () => {
    expect(filterTopics(topics, { category: "", level: "" })).toHaveLength(topics.length);
  });
});
