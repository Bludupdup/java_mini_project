import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function TopicCard({ topic }) {
  const Icon = topic.icon;
  const started = topic.progress > 0;

  return (
    <article className="topic-card">
      <div className="topic-top">
        <div className={`topic-icon ${topic.color}`}>
          <Icon size={20} />
        </div>

        <span className="topic-level">{topic.level}</span>
      </div>

      <h3>{topic.title}</h3>
      <p>{topic.description}</p>

      <div className="topic-meta">
        <span>{topic.lessons} lessons</span>
        <span>{topic.progress}%</span>
      </div>

      <div className="progress-bar">
        <span style={{ width: `${topic.progress}%` }} />
      </div>

      <Link className="topic-button" to={`/topics/${topic.id}`}>
        {started ? "Continue" : "Start topic"}
        <ArrowRight size={15} />
      </Link>
    </article>
  );
}

export default TopicCard;
