import { afterEach, describe, expect, it, vi } from "vitest";
import { emptyLearningState, learningReducer, STORAGE_KEY } from "./learningStore";
import { createLearningSync, loadLearningState, PREFERENCES_DELAY_MS } from "./learningSync";

// A fake backend: records every call; answers right away unless told otherwise.
function fakeServer(serverState = emptyLearningState()) {
  const calls = [];
  const record =
    (name) =>
    (...args) => {
      calls.push([name, ...args]);
      return Promise.resolve(null);
    };

  return {
    calls,
    fetchState: vi.fn(() => Promise.resolve(serverState)),
    replaceState: vi.fn((state) => Promise.resolve(state)),
    setBookmark: record("setBookmark"),
    visitTopic: record("visitTopic"),
    setCompleted: record("setCompleted"),
    recordStep: record("recordStep"),
    setSolved: record("setSolved"),
    setNote: record("setNote"),
    markNotificationsRead: record("markNotificationsRead"),
    updatePreferences: record("updatePreferences"),
    unlockAchievements: record("unlockAchievements"),
    resetProgress: record("resetProgress"),
    resetEverything: record("resetEverything"),
  };
}

// Wires a sync to a plain reducer, like LearningProvider does with React.
function setup(server = fakeServer()) {
  let state = emptyLearningState();
  const errors = [];
  const onSessionExpired = vi.fn();
  const sync = createLearningSync({
    server,
    dispatch: (action) => {
      state = learningReducer(state, action);
      sync.setState(state);
    },
    onSaveError: (message) => errors.push(message),
    onSessionExpired,
  });

  sync.setState(state);
  return { sync, server, errors, onSessionExpired, getState: () => state };
}

const failure = (message, status) => Object.assign(new Error(message), { status });

afterEach(() => {
  vi.useRealTimers();
});

describe("createLearningSync", () => {
  it("updates the screen at once and sends the change", async () => {
    const { sync, server, getState } = setup();

    sync.actions.toggleBookmark("graphs");
    expect(getState().bookmarks).toEqual(["graphs"]);

    sync.actions.toggleBookmark("graphs");
    expect(getState().bookmarks).toEqual([]);

    await sync.settled();
    expect(server.calls).toEqual([
      ["setBookmark", "graphs", true],
      ["setBookmark", "graphs", false],
    ]);
  });

  it("sends requests one at a time, in order", async () => {
    const server = fakeServer();
    const order = [];
    let finishSlow;
    server.setBookmark = () =>
      new Promise((resolve) => {
        order.push("save started");
        finishSlow = () => {
          order.push("save finished");
          resolve();
        };
      });
    server.setSolved = async () => order.push("solve started");

    const { sync } = setup(server);
    sync.actions.toggleBookmark("graphs");
    sync.actions.toggleSolved("two-sum");

    await Promise.resolve();
    await Promise.resolve();
    expect(order).toEqual(["save started"]);

    finishSlow();
    await sync.settled();
    expect(order).toEqual(["save started", "save finished", "solve started"]);
  });

  it("puts the screen back to what the server has when saving fails", async () => {
    const server = fakeServer({ ...emptyLearningState(), bookmarks: ["arrays"] });
    server.setBookmark = () => Promise.reject(failure("Database is down.", 500));
    const { sync, errors, getState } = setup(server);

    sync.actions.toggleBookmark("graphs");
    expect(getState().bookmarks).toEqual(["graphs"]);

    await sync.settled();
    expect(errors).toEqual(["Database is down."]);
    expect(getState().bookmarks).toEqual(["arrays"]);
  });

  it("reports an expired login instead of an error", async () => {
    const server = fakeServer();
    server.visitTopic = () => Promise.reject(failure("You're not logged in.", 401));
    const { sync, errors, onSessionExpired } = setup(server);

    sync.actions.visitTopic("arrays");
    await sync.settled();

    expect(onSessionExpired).toHaveBeenCalledOnce();
    expect(errors).toEqual([]);
  });

  it("only sends visualization steps that are new", async () => {
    const { sync, server } = setup();

    sync.actions.recordStep("arrays", 0, 5);
    sync.actions.recordStep("arrays", 2, 5);
    sync.actions.recordStep("arrays", 1, 5); // seen already
    await sync.settled();

    expect(server.calls).toEqual([
      ["recordStep", "arrays", 0, 5],
      ["recordStep", "arrays", 2, 5],
    ]);
  });

  it("skips notes that didn't change", async () => {
    const { sync, server } = setup();

    sync.actions.setNote("two-sum", "Use a hash map");
    sync.actions.setNote("two-sum", "Use a hash map");
    await sync.settled();

    expect(server.calls).toEqual([["setNote", "two-sum", "Use a hash map"]]);
  });

  it("sends preference changes together after a pause", async () => {
    vi.useFakeTimers();
    const { sync, server, getState } = setup();

    sync.actions.setPreferences({ name: "S" });
    sync.actions.setPreferences({ name: "Sam" });
    sync.actions.setPreferences({ reduceMotion: true });
    expect(getState().preferences).toMatchObject({ name: "Sam", reduceMotion: true });
    expect(server.calls).toEqual([]);

    await vi.advanceTimersByTimeAsync(PREFERENCES_DELAY_MS);
    await sync.settled();
    expect(server.calls).toEqual([["updatePreferences", { name: "Sam", reduceMotion: true }]]);
  });

  it("doesn't let a reload undo a change that is on its way", async () => {
    const server = fakeServer(emptyLearningState());
    const { sync, getState } = setup(server);

    const reload = sync.refresh();
    sync.actions.toggleBookmark("graphs"); // made while the reload was running
    await reload;
    await sync.settled();

    expect(getState().bookmarks).toEqual(["graphs"]);
  });
});

describe("loadLearningState", () => {
  function memoryStorage(entries) {
    const data = new Map(Object.entries(entries));
    return {
      get length() {
        return data.size;
      },
      key: (index) => [...data.keys()][index] ?? null,
      getItem: (key) => data.get(key) ?? null,
      removeItem: (key) => data.delete(key),
      data,
    };
  }

  it("returns what the server has", async () => {
    const saved = { ...emptyLearningState(), bookmarks: ["trees"] };
    const server = fakeServer(saved);
    const storage = memoryStorage({ [STORAGE_KEY]: '{"bookmarks":["graphs"]}' });

    expect(await loadLearningState(server, storage)).toEqual(saved);
    // The account already has data, so the old browser save is left alone.
    expect(server.replaceState).not.toHaveBeenCalled();
  });

  it("moves progress from this browser into an empty account, once", async () => {
    const server = fakeServer(emptyLearningState());
    const storage = memoryStorage({ [STORAGE_KEY]: '{"bookmarks":["graphs"]}' });

    const loaded = await loadLearningState(server, storage);

    expect(loaded.bookmarks).toEqual(["graphs"]);
    expect(server.replaceState).toHaveBeenCalledOnce();
    expect(storage.data.size).toBe(0);
  });
});
