import { createContext, useContext } from "react";

export const LearningContext = createContext(null);

/** Bookmarks, progress and the actions that change them. */
export function useLearning() {
  const value = useContext(LearningContext);

  if (!value) throw new Error("useLearning must be used inside <LearningProvider>.");

  return value;
}
