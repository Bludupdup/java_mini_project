import { useEffect } from "react";

const APP_NAME = "DSA Universe";

/** Sets the browser tab title, e.g. "Arrays · DSA Universe". */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME;
  }, [title]);
}
