import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ACHIEVEMENTS } from "../learning/achievements";
import { useLearning } from "../learning/LearningContext";

const TOAST_MS = 5000;

/** Pops up for a few seconds when an achievement unlocks. */
function AchievementToasts() {
  const { state } = useLearning();
  // Only unlocks from now on: old ones were celebrated in an earlier visit.
  const [since] = useState(() => Date.now());
  const [dismissed, setDismissed] = useState([]);

  const toasts = ACHIEVEMENTS.filter(
    (achievement) =>
      (state.achievements[achievement.id] ?? 0) >= since &&
      !dismissed.includes(achievement.id),
  );
  const toastIds = toasts.map((achievement) => achievement.id).join(",");

  useEffect(() => {
    if (!toastIds) return undefined;

    const timer = setTimeout(
      () => setDismissed((current) => [...current, ...toastIds.split(",")]),
      TOAST_MS,
    );

    return () => clearTimeout(timer);
  }, [toastIds]);

  return (
    // Always rendered, so screen readers notice when a toast appears in it.
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((achievement) => {
        const Icon = achievement.icon;

        return (
          <div className="toast" key={achievement.id}>
            <span className={`stat-icon ${achievement.color}`}>
              <Icon size={18} />
            </span>
            <span className="toast-text">
              <small>Achievement unlocked</small>
              <strong>{achievement.title}</strong>
            </span>
            <button
              type="button"
              className="toast-close"
              aria-label="Dismiss"
              onClick={() => setDismissed((current) => [...current, achievement.id])}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default AchievementToasts;
