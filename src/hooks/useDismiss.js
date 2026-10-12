import { useEffect } from "react";

/**
 * While `open`, calls onDismiss on Escape or on a click outside `ref`.
 * Used by the header's dropdown menus. Pass a stable onDismiss.
 */
export function useDismiss(ref, open, onDismiss) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") onDismiss();
    }
    function handlePointerDown(event) {
      if (!ref.current?.contains(event.target)) onDismiss();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [ref, open, onDismiss]);
}
