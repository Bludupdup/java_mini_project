/**
 * Keeps the screen and the server in step. Plain JavaScript, no React, so it
 * can be tested on its own; LearningProvider creates one per account.
 *
 * Every action does two things:
 *   1. dispatch: the reducer updates the screen at once ("optimistic update")
 *   2. send: the same change goes to the server
 * Requests go one at a time, in order, so a quick "save, unsave" can't arrive
 * as "unsave, save". If one fails, the screen is reset to what the server
 * really has, so it never shows a change that wasn't saved.
 */

import {
  findLegacyProgress,
  hasLearningData,
  learningReducer,
  MAX_NOTE_LENGTH,
  removeLegacyProgress,
  sanitizeLearningState,
} from "./learningStore";

// Typing a display name sends one request after a short pause, not one per key.
export const PREFERENCES_DELAY_MS = 500;

/**
 * The account's data from the server. The first time an account loads, it
 * also takes over progress this browser saved before progress lived on the
 * server, so nothing is lost.
 */
export async function loadLearningState(server, storage = globalThis.localStorage) {
  const saved = sanitizeLearningState(await server.fetchState());

  if (hasLearningData(saved)) return saved;

  const legacy = findLegacyProgress(storage);
  if (!legacy) return saved;

  const imported = sanitizeLearningState(await server.replaceState(legacy.state));
  removeLegacyProgress(legacy.keys, storage);
  return imported;
}

/**
 * server: the functions in learningClient.js (or fakes, in tests).
 * dispatch: the learningReducer's dispatch.
 * onSaveError(message), onSessionExpired(): tell the app something went wrong.
 */
export function createLearningSync({ server, dispatch, onSaveError, onSessionExpired }) {
  let state = null; // the latest state on screen; see setState
  let queue = Promise.resolve();
  let pendingRequests = 0;
  let changeCount = 0; // bumped by every change, so a slow reload can tell it's out of date
  let preferenceChanges = {};
  let preferenceTimer = null;

  function send(request) {
    pendingRequests += 1;
    queue = queue
      .then(request)
      .catch(async (error) => {
        if (error.status === 401) {
          onSessionExpired();
          return;
        }

        onSaveError(error.message);
        try {
          dispatch({ type: "replace", state: sanitizeLearningState(await server.fetchState()) });
        } catch {
          // Server unreachable: keep what is on screen.
        }
      })
      .finally(() => {
        pendingRequests -= 1;
      });
  }

  function change(action) {
    changeCount += 1;
    dispatch(action);
  }

  const actions = {
    toggleBookmark(id) {
      const saved = state.bookmarks.includes(id);
      change({ type: "toggleBookmark", id });
      send(() => server.setBookmark(id, !saved));
    },

    visitTopic(id) {
      change({ type: "visit", id, now: Date.now() });
      send(() => server.visitTopic(id));
    },

    setCompleted(id, completed) {
      change({ type: "setCompleted", id, completed, now: Date.now() });
      send(() => server.setCompleted(id, completed));
    },

    recordStep(id, step, total) {
      const action = { type: "recordStep", id, step, total, now: Date.now() };
      // Going back to a step seen before changes nothing: no request needed.
      if (learningReducer(state, action) === state) return;

      change(action);
      send(() => server.recordStep(id, step, total));
    },

    toggleSolved(id) {
      const solved = Boolean(state.problems[id]?.solvedAt);
      change({ type: "toggleSolved", id, now: Date.now() });
      send(() => server.setSolved(id, !solved));
    },

    setNote(id, note) {
      const text = note.slice(0, MAX_NOTE_LENGTH);
      if ((state.problems[id]?.note ?? "") === text) return;

      change({ type: "setNote", id, note: text });
      send(() => server.setNote(id, text));
    },

    markNotificationsRead() {
      change({ type: "markNotificationsRead", now: Date.now() });
      send(() => server.markNotificationsRead());
    },

    setPreferences(changes) {
      change({ type: "setPreferences", changes });

      preferenceChanges = { ...preferenceChanges, ...changes };
      clearTimeout(preferenceTimer);
      preferenceTimer = setTimeout(() => {
        const pending = preferenceChanges;
        preferenceChanges = {};
        send(() => server.updatePreferences(pending));
      }, PREFERENCES_DELAY_MS);
    },

    importState(data) {
      const imported = sanitizeLearningState(data);
      change({ type: "replace", state: imported });
      send(async () => {
        const saved = await server.replaceState(imported);
        dispatch({ type: "replace", state: sanitizeLearningState(saved) });
      });
    },

    resetProgress() {
      change({ type: "resetProgress" });
      send(() => server.resetProgress());
    },

    resetEverything() {
      change({ type: "resetEverything" });
      send(() => server.resetEverything());
    },
  };

  return {
    actions,

    /** The provider calls this after every render, so actions see the latest state. */
    setState(next) {
      state = next;
    },

    unlockAchievements(ids, now) {
      dispatch({ type: "unlockAchievements", ids, now });
      send(() => server.unlockAchievements(ids));
    },

    /** Reload from the server (another tab may have changed something), unless changes are on their way. */
    refresh() {
      if (!state || pendingRequests > 0) return Promise.resolve();

      const changesBefore = changeCount;

      return server.fetchState().then(
        (fresh) => {
          if (changeCount === changesBefore && pendingRequests === 0) {
            dispatch({ type: "replace", state: sanitizeLearningState(fresh) });
          }
        },
        () => {},
      );
    },

    /** Resolves when every request so far has been answered (used by tests). */
    settled: () => queue,

    /** Logging out: forget a preference change that hasn't been sent yet. */
    dispose() {
      clearTimeout(preferenceTimer);
    },
  };
}
