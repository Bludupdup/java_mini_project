import { useEffect, useMemo, useReducer } from "react";
import { problems } from "../data/problems";
import { topics } from "../data/topics";
import { findNewAchievements } from "./achievements";
import { LearningContext } from "./LearningContext";
import {
  getLearningStats,
  getTopicProgress,
  learningReducer,
  loadLearningState,
  sanitizeLearningState,
  saveLearningState,
  userStorageKey,
} from "./learningStore";

/**
 * Keeps one account's progress, achievements and preferences, saved in
 * localStorage. Render it with key={userId}, so switching accounts starts fresh.
 */
function LearningProvider({ userId, children }) {
  const storageKey = userStorageKey(userId);
  const [state, dispatch] = useReducer(learningReducer, undefined, () =>
    loadLearningState(storageKey),
  );

  useEffect(() => {
    saveLearningState(state, storageKey);
  }, [state, storageKey]);

  // Unlock achievements as soon as they are earned.
  useEffect(() => {
    const now = Date.now();
    const ids = findNewAchievements(
      getLearningStats(topics, problems, state, now),
      state.achievements,
    );

    if (ids.length > 0) dispatch({ type: "unlockAchievements", ids, now });
  }, [state]);

  // Settings → "Reduce motion" turns animations off everywhere (see index.css).
  // The cleanup also runs on logout, so the next person starts with the default.
  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("reduce-motion", state.preferences.reduceMotion);
    return () => root.classList.remove("reduce-motion");
  }, [state.preferences.reduceMotion]);

  // Another tab saved new data: follow it, so both tabs agree.
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === storageKey) {
        dispatch({ type: "replace", state: loadLearningState(storageKey) });
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [storageKey]);

  // Created once, so effects that call them don't re-run on every change.
  const actions = useMemo(
    () => ({
      toggleBookmark: (id) => dispatch({ type: "toggleBookmark", id }),
      visitTopic: (id) => dispatch({ type: "visit", id, now: Date.now() }),
      setCompleted: (id, completed) =>
        dispatch({ type: "setCompleted", id, completed, now: Date.now() }),
      recordStep: (id, step, total) =>
        dispatch({ type: "recordStep", id, step, total, now: Date.now() }),
      toggleSolved: (id) => dispatch({ type: "toggleSolved", id, now: Date.now() }),
      setNote: (id, note) => dispatch({ type: "setNote", id, note }),
      markNotificationsRead: () => dispatch({ type: "markNotificationsRead", now: Date.now() }),
      setPreferences: (changes) => dispatch({ type: "setPreferences", changes }),
      importState: (data) => dispatch({ type: "replace", state: sanitizeLearningState(data) }),
      resetProgress: () => dispatch({ type: "resetProgress" }),
      resetEverything: () => dispatch({ type: "resetEverything" }),
    }),
    [],
  );

  const value = useMemo(
    () => ({
      state,
      ...actions,
      isBookmarked: (id) => state.bookmarks.includes(id),
      isSolved: (id) => Boolean(state.problems[id]?.solvedAt),
      getProgress: (id) => getTopicProgress(state.topics[id]),
    }),
    [state, actions],
  );

  return <LearningContext value={value}>{children}</LearningContext>;
}

export default LearningProvider;
