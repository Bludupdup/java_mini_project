import { useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/apiClient";
import Splash from "../components/Splash";
import { buildCatalog } from "./catalog";
import { CatalogContext } from "./CatalogContext";

/**
 * Loads the topics (with their lessons and problems) from the database once,
 * and shares them with every page. Until they arrive, shows a loading screen.
 */
function CatalogProvider({ children }) {
  const [result, setResult] = useState({ topics: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/topics")
      .then((data) => !cancelled && setResult({ topics: data.topics, error: null }))
      .catch((error) => !cancelled && setResult({ topics: null, error: error.message }));

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setResult({ topics: null, error: null });
    setAttempt((count) => count + 1);
  }, []);

  const catalog = useMemo(() => result.topics && buildCatalog(result.topics), [result.topics]);

  if (result.error) return <Splash error={result.error} onRetry={retry} />;
  if (!catalog) return <Splash message="Loading topics…" />;

  return <CatalogContext value={catalog}>{children}</CatalogContext>;
}

export default CatalogProvider;
