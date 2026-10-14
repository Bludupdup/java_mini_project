import { createContext, useContext } from "react";

export const CatalogContext = createContext(null);

/** { topics, problems, getTopic, getTopicProblems }, loaded from the backend. */
export function useCatalog() {
  const value = useContext(CatalogContext);

  if (!value) throw new Error("useCatalog must be used inside <CatalogProvider>.");

  return value;
}
