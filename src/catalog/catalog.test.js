import { BookOpen, Brackets } from "lucide-react";
import { describe, expect, it } from "vitest";
import { buildCatalog, PROBLEM_DIFFICULTIES } from "./catalog";
import fixture from "../test/catalogFixture.json";

const apiTopic = (id, icon, problems = []) => ({ id, title: id.toUpperCase(), icon, problems });

describe("buildCatalog", () => {
  it("turns icon names into components, with a fallback", () => {
    const { topics } = buildCatalog([apiTopic("a", "Brackets"), apiTopic("b", "NoSuchIcon")]);

    expect(topics.map((topic) => topic.icon)).toEqual([Brackets, BookOpen]);
  });

  it("lists every problem once, with its topic", () => {
    const catalog = buildCatalog([
      apiTopic("a", "Hash", [{ id: "p1", difficulty: "Easy" }]),
      apiTopic("b", "Hash", [
        { id: "p2", difficulty: "Hard" },
        { id: "p3", difficulty: "Easy" },
      ]),
    ]);

    expect(catalog.problems.map((problem) => [problem.id, problem.topicId, problem.topicTitle])).toEqual([
      ["p1", "a", "A"],
      ["p2", "b", "B"],
      ["p3", "b", "B"],
    ]);
    expect(catalog.getTopicProblems("b").map((problem) => problem.id)).toEqual(["p2", "p3"]);
    expect(catalog.getTopic("a").title).toBe("A");
    expect(catalog.getTopic("missing")).toBeUndefined();
  });

  it("reads the real catalog: unique ids, known icons and difficulties", () => {
    const { topics, problems } = buildCatalog(fixture.topics);
    const ids = problems.map((problem) => problem.id);

    expect(new Set(topics.map((topic) => topic.id)).size).toBe(topics.length);
    expect(new Set(ids).size).toBe(ids.length);
    expect(topics.every((topic) => topic.icon !== BookOpen)).toBe(true);
    expect(problems.every((problem) => PROBLEM_DIFFICULTIES.includes(problem.difficulty))).toBe(true);
  });
});
