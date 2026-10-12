import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Code2,
  ExternalLink,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import VisualizationPanel from "../components/VisualizationPanel";
import { topics } from "../data/topics";
import "./TopicPage.css";

function TopicPage() {
  const { topicId } = useParams();
  const topic = topics.find((item) => item.id === topicId);

  if (!topic) {
    return (
      <div className="topic-page">
        <Link className="topic-back-button" to="/">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>

        <section className="topic-panel">
          <h2>Topic not found</h2>
          <p className="resource-subtitle">
            There is no topic called "{topicId}" yet.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="topic-page">
      <Link className="topic-back-button" to="/">
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      <section className="topic-hero">
        <span className="topic-eyebrow">
          <Code2 size={15} />
          {topic.category}
        </span>

        <div className="topic-title-row">
          <div>
            <h1>{topic.title}</h1>
            <p className="topic-description">{topic.description}</p>
          </div>
          <span className={`difficulty-badge ${topic.level.toLowerCase()}`}>
            {topic.level}
          </span>
        </div>

        <div className="topic-quick-stats">
          <span><BookOpen size={16} /> {topic.lessons} lessons</span>
          <span><Clock3 size={16} /> {topic.readTime}</span>
        </div>
      </section>

      <div className="topic-layout">
        <div className="topic-main">
          <section className="topic-panel">
            <div className="topic-section-heading">
              <div className="topic-heading-icon purple">
                <BookOpen size={19} />
              </div>
              <div>
                <h2>Understanding the concept</h2>
                <p>Learn the core idea first</p>
              </div>
            </div>

            <p className="topic-body-text">{topic.theory}</p>

            <div className="topic-tip">
              <Lightbulb size={19} />
              <p>
                <strong>Remember:</strong> {topic.tip}
              </p>
            </div>
          </section>

          <section className="topic-panel">
            <div className="topic-section-heading">
              <div className="topic-heading-icon blue">
                <PlayCircle size={19} />
              </div>
              <div>
                <h2>How it works</h2>
                <p>Follow it step by step</p>
              </div>
            </div>

            <ol className="topic-steps">
              {topic.steps.map((step, index) => (
                <li key={step}>
                  <span className="step-number">{index + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* key: a new topic gets a fresh panel instead of the last topic's plan. */}
          <VisualizationPanel key={topic.id} topic={topic} />

          <section className="topic-panel">
            <div className="topic-section-heading">
              <div className="topic-heading-icon blue">
                <Code2 size={19} />
              </div>
              <div>
                <h2>Pseudocode</h2>
                <p>The logic in a language-independent format</p>
              </div>
            </div>

            <pre className="topic-code">
              <code>{topic.pseudocode}</code>
            </pre>
          </section>

          <section className="topic-panel">
            <div className="topic-section-heading">
              <div className="topic-heading-icon purple">
                <Clock3 size={19} />
              </div>
              <div>
                <h2>Complexity analysis</h2>
                <p>Understand time and space requirements</p>
              </div>
            </div>

            <div className="complexity-grid">
              {topic.complexity.map((item) => (
                <article className="complexity-card" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <p>{item.note}</p>
                </article>
              ))}
            </div>
          </section>
        </div>

        <aside className="topic-resources">
          <section className="topic-panel">
            <h2>Learning resources</h2>
            <p className="resource-subtitle">
              Continue learning with these references.
            </p>

            {topic.resources.map((resource) => (
              <a
                className="resource-link"
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                key={resource.title}
              >
                <div className="resource-icon">
                  <PlayCircle size={19} />
                </div>
                <div className="resource-info">
                  <strong>{resource.title}</strong>
                  <span>{resource.source}</span>
                </div>
                <ExternalLink size={15} />
              </a>
            ))}
          </section>

          <section className="topic-panel">
            <h2>Practice problems</h2>
            <p className="resource-subtitle">
              Apply what you have learned.
            </p>

            {topic.problems.map((problem) => (
              <a
                className="problem-link"
                href={problem.url}
                target="_blank"
                rel="noreferrer"
                key={problem.title}
              >
                <div>
                  <strong>{problem.title}</strong>
                  <span>{problem.platform} · {problem.difficulty}</span>
                </div>
                <ExternalLink size={15} />
              </a>
            ))}
          </section>
        </aside>
      </div>
    </div>
  );
}

export default TopicPage;
