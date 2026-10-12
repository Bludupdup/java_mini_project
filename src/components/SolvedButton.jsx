import { Check } from "lucide-react";
import { useLearning } from "../learning/LearningContext";

/** A checkbox-like button that marks a practice problem as solved. */
function SolvedButton({ problem }) {
  const { isSolved, toggleSolved } = useLearning();
  const solved = isSolved(problem.id);

  return (
    <button
      type="button"
      className={`solved-button ${solved ? "solved" : ""}`}
      onClick={() => toggleSolved(problem.id)}
      aria-pressed={solved}
      aria-label={`Solved: ${problem.title}`}
      title={solved ? "Solved. Click to undo." : "Mark as solved"}
    >
      <Check size={15} strokeWidth={3} />
    </button>
  );
}

export default SolvedButton;
