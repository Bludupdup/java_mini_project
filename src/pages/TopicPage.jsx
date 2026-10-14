import { useEffect } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  CircleCheckBig,
  Circle,
  Clock3,
  Code2,
  Cpu,
  ExternalLink,
  Lightbulb,
  PlayCircle,
} from "lucide-react";
import BookmarkButton from "../components/BookmarkButton";
import SolvedButton from "../components/SolvedButton";
import VisualizationPanel from "../components/VisualizationPanel";
import { useCatalog } from "../catalog/CatalogContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLearning } from "../learning/LearningContext";
import "./TopicPage.css";

// Goes back to wherever the learner came from. Opened from a link or a
// bookmark there is nothing to go back to, so go to the topics list instead.
function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const hasHistory = location.key !== "default";

  return (
    <button
      type="button"
      className="topic-back-button"
      onClick={() => (hasHistory ? navigate(-1) : navigate("/topics"))}
    >
      <ArrowLeft size={16} />
      {hasHistory ? "Back" : "All topics"}
    </button>
  );
}

function TopicPage() {
  const { topicId } = useParams();
  const { topics, getTopic, getTopicProblems } = useCatalog();
  const topic = getTopic(topicId);
  const { visitTopic, setCompleted, getProgress } = useLearning();

  useDocumentTitle(topic ? topic.title : "Topic not found");

  // Opening a topic counts as starting it.
  useEffect(() => {
    if (topic) visitTopic(topic.id);
  }, [topic, visitTopic]);

  if (!topic) {
    return (
      <div className="topic-page">
        <BackButton />

        <section className="topic-panel">
          <h2>Topic not found</h2>
          <p className="resource-subtitle">
            There is no topic called "{topicId}" yet.{" "}
            <Link className="inline-link" to="/topics">
              Browse all topics
            </Link>
          </p>
        </section>
      </div>
    );
  }

  const { status, percent } = getProgress(topic.id);
  const completed = status === "completed";
  const index = topics.indexOf(topic);
  const previous = topics[index - 1];
  const next = topics[index + 1];
  const topicProblems = getTopicProblems(topic.id);

  return (
    <div className="topic-page">
      <BackButton />

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
          <span><ChartNoAxesCombined size={16} /> {percent}% done</span>
        </div>

        <div className="topic-actions">
          <button
            type="button"
            className={`complete-button ${completed ? "done" : ""}`}
            aria-pressed={completed}
            onClick={() => setCompleted(topic.id, !completed)}
          >
            {completed ? <CircleCheckBig size={17} /> : <Circle size={17} />}
            {completed ? "Completed" : "Mark as complete"}
          </button>
          <BookmarkButton topic={topic} variant="full" />
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
              Apply what you have learned, then tick off what you solved.
            </p>

            {topicProblems.map((problem) => (
              <div className="problem-item" key={problem.id}>
                <SolvedButton problem={problem} />
                <a
                  className="problem-link"
                  href={problem.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div>
                    <strong>{problem.title}</strong>
                    <span>{problem.platform} · {problem.difficulty}</span>
                  </div>
                  <ExternalLink size={15} />
                </a>
              </div>
            ))}

            <Link className="text-button practice-link" to={`/practice?topic=${topic.id}`}>
              Notes and more in Practice <ArrowRight size={15} />
            </Link>
          </section>

          {topic.algorithms?.length > 0 && (
            <section className="topic-panel">
              <h2>Algorithms in this topic</h2>
              <p className="resource-subtitle">
                Each with steps, a worked example and C++ code.
              </p>

              {topic.algorithms.map((algorithm) => (
                <Link className="resource-link" to={`/algorithms/${algorithm.id}`} key={algorithm.id}>
                  <div className="resource-icon">
                    <Cpu size={19} />
                  </div>
                  <div className="resource-info">
                    <strong>{algorithm.name}</strong>
                    <span>Algorithm library</span>
                  </div>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </section>
          )}
        </aside>
      </div>

      <nav className="topic-pager" aria-label="Other topics">
        {previous && (
          <Link className="pager-link" to={`/topics/${previous.id}`}>
            <ArrowLeft size={17} />
            <span>
              <small>Previous topic</small>
              {previous.title}
            </span>
          </Link>
        )}
        {next && (
          <Link className="pager-link next" to={`/topics/${next.id}`}>
            <span>
              <small>Next topic</small>
              {next.title}
            </span>
            <ArrowRight size={17} />
          </Link>
        )}
      </nav>
    </div>
  );
}

export default TopicPage;
