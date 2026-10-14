/**
 * The topic catalog for tests: catalogFixture.json is a copy of what
 * GET /api/topics returns for the seeded database, run through buildCatalog
 * just like the app does.
 */
import { buildCatalog } from "../catalog/catalog";
import fixture from "./catalogFixture.json";

export const { topics, problems, getTopic, getTopicProblems } = buildCatalog(fixture.topics);
