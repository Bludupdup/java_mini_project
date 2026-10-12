import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import BookmarkButton from "./BookmarkButton";
import { useLearning } from "../learning/LearningContext";

const ACTION_LABELS = {
  "not-started": "Start topic",
  "in-progress": "Continue",
  completed: "Review",
};

function TopicCard({ topic }) {
  const Icon = topic.icon;
  const { getProgress } = useLearning();
  const { status, percent } = getProgress(topic.id);
  const statusText =
    status === "completed" ? "Completed" : status === "in-progress" ? `${percent}%` : "Not started";

  return (
    <article className={`topic-card ${status}`}>
      <div className="topic-top">
        <div className={`topic-icon ${topic.color}`}>
          <Icon size={20} />
        </div>

        <div className="topic-top-right">
          <span className="topic-level">{topic.level}</span>
          <BookmarkButton topic={topic} />
        </div>
      </div>

      <h3>{topic.title}</h3>
      <p>{topic.description}</p>

      <div className="topic-meta">
        <span>{topic.lessons} lessons</span>
        <span>{statusText}</span>
      </div>

      <div
        className="progress-bar"
        role="progressbar"
        aria-label={`${topic.title} progress`}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${percent}%` }} />
      </div>

      {/* Its ::after stretches over the whole card, so the card is clickable. */}
      <Link className="topic-button" to={`/topics/${topic.id}`}>
        {ACTION_LABELS[status]}
        <ArrowRight size={15} />
      </Link>
    </article>
  );
}

export default TopicCard;
