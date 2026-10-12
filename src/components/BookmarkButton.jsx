import { Bookmark, BookmarkCheck } from "lucide-react";
import { useLearning } from "../learning/LearningContext";

/**
 * Saves a topic for later. "icon" is the small square on cards;
 * "full" adds the words "Save" / "Saved".
 */
function BookmarkButton({ topic, variant = "icon" }) {
  const { isBookmarked, toggleBookmark } = useLearning();
  const saved = isBookmarked(topic.id);
  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      className={`bookmark-button ${variant} ${saved ? "saved" : ""}`}
      onClick={() => toggleBookmark(topic.id)}
      aria-pressed={saved}
      aria-label={variant === "icon" ? `Save ${topic.title}` : undefined}
      title={saved ? "Remove from saved topics" : "Save for later"}
    >
      <Icon size={variant === "icon" ? 16 : 17} />
      {variant === "full" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}

export default BookmarkButton;
