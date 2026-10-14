import { useEffect, useLayoutEffect, useMemo, useReducer, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useCatalog } from "../catalog/CatalogContext";
import Splash from "../components/Splash";
import { findNewAchievements } from "./achievements";
import { LearningContext } from "./LearningContext";
import * as server from "./learningClient";
import { getLearningStats, getTopicProgress, learningReducer } from "./learningStore";
import { createLearningSync, loadLearningState } from "./learningSync";

/**
 * Keeps one account's progress, achievements and preferences, saved in the
 * database through the backend. learningSync.js does the saving: each action
 * updates the screen at once, then sends the change to the server.
 * Render it with key={userId}, so switching accounts starts fresh.
 */
function LearningProvider({ children }) {
  const { topics, problems } = useCatalog();
  const { sessionExpired } = useAuth();
  const [state, dispatch] = useReducer(learningReducer, null); // null until loaded
  const [loadError, setLoadError] = useState(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [saveError, setSaveError] = useState(null);

  // Created once; it lives as long as this account is logged in.
  const [sync] = useState(() =>
    createLearningSync({
      server,
      dispatch,
      onSaveError: setSaveError,
      onSessionExpired: sessionExpired,
    }),
  );

  // Actions read the state from sync, so keep it up to date.
  useLayoutEffect(() => {
    sync.setState(state);
  }, [sync, state]);

  useEffect(() => () => sync.dispose(), [sync]);

  useEffect(() => {
    let cancelled = false;

    loadLearningState(server).then(
      (loaded) => !cancelled && dispatch({ type: "replace", state: loaded }),
      (error) => {
        if (cancelled) return;
        if (error.status === 401) sessionExpired();
        else setLoadError(error.message);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [loadAttempt, sessionExpired]);

  // Back from another tab or window: pick up changes made there.
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") sync.refresh();
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [sync]);

  // Unlock achievements as soon as they are earned.
  useEffect(() => {
    if (!state) return;

    const now = Date.now();
    const ids = findNewAchievements(
      getLearningStats(topics, problems, state, now),
      state.achievements,
    );

    if (ids.length > 0) sync.unlockAchievements(ids, now);
  }, [state, topics, problems, sync]);

  // Settings → "Reduce motion" turns animations off everywhere (see index.css).
  // The cleanup also runs on logout, so the next person starts with the default.
  const reduceMotion = Boolean(state?.preferences.reduceMotion);

  useEffect(() => {
    const root = document.documentElement;

    root.classList.toggle("reduce-motion", reduceMotion);
    return () => root.classList.remove("reduce-motion");
  }, [reduceMotion]);

  const value = useMemo(
    () =>
      state && {
        state,
        ...sync.actions,
        isBookmarked: (id) => state.bookmarks.includes(id),
        isSolved: (id) => Boolean(state.problems[id]?.solvedAt),
        getProgress: (id) => getTopicProgress(state.topics[id]),
        saveError,
        dismissSaveError: () => setSaveError(null),
      },
    [state, sync, saveError],
  );

  if (loadError) {
    return (
      <Splash
        error={loadError}
        onRetry={() => {
          setLoadError(null);
          setLoadAttempt((count) => count + 1);
        }}
      />
    );
  }

  if (!value) return <Splash message="Loading your progress…" />;

  return <LearningContext value={value}>{children}</LearningContext>;
}

export default LearningProvider;
