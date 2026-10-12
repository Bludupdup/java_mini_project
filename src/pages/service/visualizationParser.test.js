import { describe, expect, it } from "vitest";
import { parsePlanReply } from "./visualizationParser";

const plan = { title: "Demo", scene: { type: "3d", objects: [], relationships: [] }, steps: [] };
const json = JSON.stringify(plan);

describe("parsePlanReply", () => {
  it("reads bare JSON", () => {
    expect(parsePlanReply(json)).toEqual({ plan, error: null });
  });

  it("strips markdown fences", () => {
    expect(parsePlanReply("```json\n" + json + "\n```").plan).toEqual(plan);
  });

  it("ignores chatter around the object", () => {
    expect(parsePlanReply(`Here is your plan:\n${json}\nEnjoy!`).plan).toEqual(plan);
  });

  it('unwraps a plan nested under "plan"', () => {
    expect(parsePlanReply(JSON.stringify({ plan })).plan).toEqual(plan);
  });

  it("reports problems instead of throwing", () => {
    expect(parsePlanReply("").error).toBe("The reply was empty.");
    expect(parsePlanReply("[1, 2, 3]").error).toBe(
      "The reply does not contain a JSON object.",
    );
    expect(parsePlanReply('{"title": "cut off').error).toMatch(
      /^The reply (is not valid JSON|does not contain a JSON object)/,
    );
    expect(parsePlanReply('{"title": }').error).toMatch(/^The reply is not valid JSON/);
  });
});
