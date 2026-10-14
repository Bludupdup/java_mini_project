/**
 * The learner's data on the server (/api/learning on the Java backend).
 * Topic and problem ids are the slugs the pages already use ("arrays", "two-sum").
 */

import { apiRequest } from "../api/apiClient";

const segment = (id) => encodeURIComponent(id);

/** The whole state, in the shape learningStore.js describes. */
export const fetchState = () => apiRequest("/learning");

/** Replaces everything (Settings → Import) and returns what the server kept. */
export const replaceState = (state) => apiRequest("/learning", { method: "PUT", body: state });

export const resetProgress = () => apiRequest("/learning/progress", { method: "DELETE" });

export const resetEverything = () => apiRequest("/learning", { method: "DELETE" });

export const visitTopic = (topicId) =>
  apiRequest(`/learning/topics/${segment(topicId)}/visit`, { method: "POST" });

export const setCompleted = (topicId, completed) =>
  apiRequest(`/learning/topics/${segment(topicId)}/completed`, {
    method: "PUT",
    body: { completed },
  });

export const recordStep = (topicId, step, total) =>
  apiRequest(`/learning/topics/${segment(topicId)}/visualization`, {
    method: "PUT",
    body: { step, total },
  });

export const setBookmark = (topicId, saved) =>
  apiRequest(`/learning/bookmarks/${segment(topicId)}`, { method: saved ? "PUT" : "DELETE" });

export const setSolved = (problemId, solved) =>
  apiRequest(`/learning/problems/${segment(problemId)}/solved`, {
    method: "PUT",
    body: { solved },
  });

export const setNote = (problemId, note) =>
  apiRequest(`/learning/problems/${segment(problemId)}/note`, { method: "PUT", body: { note } });

export const unlockAchievements = (ids) =>
  apiRequest("/learning/achievements", { method: "POST", body: { ids } });

export const markNotificationsRead = () =>
  apiRequest("/learning/notifications-seen", { method: "PUT" });

/** Only the fields in `changes` are updated: { name?, playbackSpeed?, reduceMotion? }. */
export const updatePreferences = (changes) =>
  apiRequest("/learning/preferences", { method: "PATCH", body: changes });
