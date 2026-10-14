import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Clock3,
  Code2,
  Cpu,
  ExternalLink,
  FlaskConical,
  HardDrive,
  ListChecks,
  LoaderCircle,
  PlayCircle,
  RefreshCw,
  Sigma,
  Terminal,
  TriangleAlert,
} from "lucide-react";
import { firstSentence, problemIdFromUrl, splitSteps } from "../algorithms/algorithmText";
import { apiRequest } from "../api/apiClient";
import { useCatalog } from "../catalog/CatalogContext";
import SolvedButton from "../components/SolvedButton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./TopicPage.css";

/** Loads GET /api/algorithms/{id}: { algorithm, error, notFound, retry }. */
function useAlgorithm(id) {
  const [result, setResult] = useState({ id: null, algorithm: null, error: null, status: 0 });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest(`/algorithms/${encodeURIComponent(id)}`).then(
      (algorithm) => !cancelled && setResult({ id, algorithm, error: null, status: 200 }),
      (error) => !cancelled && setResult({ id, algorithm: null, error: error.message, status: error.status }),
    );

    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  // Moving to another algorithm: don't show the previous one while loading.
  const current = result.id === id ? result : { algorithm: null, error: null, status: 0 };

  return {
    algorithm: current.algorithm,
    error: current.error,
    notFound: current.status === 404,
    retry: () => {
      setResult({ id: null, algorithm: null, error: null, status: 0 });
      setAttempt((count) => count + 1);
    },
  };
}

function Panel({ icon: Icon, color = "purple", title, subtitle, children }) {
  return (
    <section className="topic-panel">
      <div className="topic-section-heading">
        <div className={`topic-heading-icon ${color}`}>
          <Icon size={19} />
        </div>
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function BackToLibrary() {
  return (
    <Link className="topic-back-button" to="/algorithms">
      <ArrowLeft size={16} />
      All algorithms
    </Link>
  );
}

/** One row of the algorithms table, shown in full. */
function AlgorithmPage() {
  const { algorithmId } = useParams();
  const { problems } = useCatalog();
  const { algorithm, error, notFound, retry } = useAlgorithm(algorithmId);

  useDocumentTitle(algorithm ? algorithm.name : notFound ? "Algorithm not found" : "Algorithm");

  if (notFound || error || !algorithm) {
    return (
      <div className="topic-page">
        <BackToLibrary />
        {notFound ? (
          <p className="empty-state">
            There is no algorithm called "{algorithmId}".{" "}
            <Link className="inline-link" to="/algorithms">
              Browse all algorithms
            </Link>
          </p>
        ) : error ? (
          <div className="empty-state" role="alert">
            <p>
              <TriangleAlert size={16} /> {error}
            </p>
            <button type="button" className="secondary-button" onClick={retry}>
              <RefreshCw size={15} /> Try again
            </button>
          </div>
        ) : (
          <p className="empty-state" role="status">
            <LoaderCircle className="viz-spin" size={16} /> Loading…
          </p>
        )}
      </div>
    );
  }

  const { topic, complexity, leetcode } = algorithm;
  const steps = splitSteps(algorithm.working);
  // The same problem may also be one of the app's practice problems: then it can be ticked off.
  const practiceProblem = leetcode && problems.find((problem) => problem.id === problemIdFromUrl(leetcode.url));
  const complexityRows = [
    ["Best case", complexity?.best],
    ["Average case", complexity?.average],
    ["Worst case", complexity?.worst],
    ["Space", complexity?.space],
  ].filter(([, value]) => value);

  return (
    <div className="topic-page">
      <BackToLibrary />

      <section className="topic-hero">
        <span className="topic-eyebrow">
          <Cpu size={15} />
          {topic ? topic.title : "Algorithm"}
        </span>

        <div className="topic-title-row">
          <div>
            <h1>{algorithm.name}</h1>
            <p className="topic-description">{firstSentence(algorithm.description)}</p>
          </div>
        </div>

        <div className="topic-quick-stats">
          {complexity?.average && (
            <span>
              <Clock3 size={16} /> {complexity.average} time
            </span>
          )}
          {complexity?.space && (
            <span>
              <HardDrive size={16} /> {complexity.space} space
            </span>
          )}
        </div>

        {topic && (
          <div className="topic-actions">
            <Link className="secondary-button" to={`/topics/${topic.id}`}>
              <BookOpen size={16} /> Open the topic: {topic.title}
            </Link>
          </div>
        )}
      </section>

      <div className="topic-layout">
        <div className="topic-main">
          <Panel icon={BookOpen} title="What it is" subtitle="The idea in a nutshell">
            <p className="topic-body-text">{algorithm.description}</p>
          </Panel>

          {steps.length > 0 && (
            <Panel icon={PlayCircle} color="blue" title="How it works" subtitle="Follow it step by step">
              <ol className="topic-steps">
                {steps.map((step, index) => (
                  <li key={`${index}-${step}`}>
                    <span className="step-number">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Panel>
          )}

          {algorithm.example && (
            <Panel icon={FlaskConical} color="purple" title="Example" subtitle="A worked example">
              <p className="topic-body-text algorithm-preformatted">{algorithm.example}</p>
            </Panel>
          )}

          {algorithm.cppCode && (
            <Panel icon={Code2} color="blue" title="C++ code" subtitle="A complete program you can compile and run">
              <pre className="topic-code">
                <code>{algorithm.cppCode}</code>
              </pre>

              {algorithm.output && (
                <>
                  <h3 className="algorithm-output-label">
                    <Terminal size={15} /> Output
                  </h3>
                  <pre className="topic-code algorithm-output">
                    <code>{algorithm.output}</code>
                  </pre>
                </>
              )}
            </Panel>
          )}

          {algorithm.recurrence && (
            <Panel icon={Sigma} color="purple" title="Recurrence" subtitle="How the answer is built from smaller ones">
              <pre className="topic-code">
                <code>{algorithm.recurrence}</code>
              </pre>
            </Panel>
          )}

          {complexityRows.length > 0 && (
            <Panel icon={Clock3} color="purple" title="Complexity analysis" subtitle="Time and space requirements">
              <div className="complexity-grid">
                {complexityRows.map(([label, value]) => (
                  <article className="complexity-card" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </article>
                ))}
              </div>
            </Panel>
          )}

          {(algorithm.applications || algorithm.advantages || algorithm.disadvantages) && (
            <Panel icon={ListChecks} color="blue" title="Where it's used" subtitle="Applications, strengths and weaknesses">
              <dl className="algorithm-facts">
                {algorithm.applications && (
                  <>
                    <dt>Applications</dt>
                    <dd>{algorithm.applications}</dd>
                  </>
                )}
                {algorithm.advantages && (
                  <>
                    <dt>Advantages</dt>
                    <dd>{algorithm.advantages}</dd>
                  </>
                )}
                {algorithm.disadvantages && (
                  <>
                    <dt>Disadvantages</dt>
                    <dd>{algorithm.disadvantages}</dd>
                  </>
                )}
              </dl>
            </Panel>
          )}
        </div>

        <aside className="topic-resources">
          {algorithm.youtubeUrl && (
            <section className="topic-panel">
              <h2>Learning resources</h2>
              <p className="resource-subtitle">Watch it explained.</p>

              <a className="resource-link" href={algorithm.youtubeUrl} target="_blank" rel="noreferrer">
                <div className="resource-icon">
                  <PlayCircle size={19} />
                </div>
                <div className="resource-info">
                  <strong>Video lesson</strong>
                  <span>YouTube</span>
                </div>
                <ExternalLink size={15} />
              </a>
            </section>
          )}

          {leetcode && (
            <section className="topic-panel">
              <h2>Practice problem</h2>
              <p className="resource-subtitle">Try it yourself on LeetCode.</p>

              <div className="problem-item">
                {practiceProblem && <SolvedButton problem={practiceProblem} />}
                <a className="problem-link" href={leetcode.url} target="_blank" rel="noreferrer">
                  <div>
                    <strong>{leetcode.title}</strong>
                    <span>LeetCode{leetcode.difficulty ? ` · ${leetcode.difficulty}` : ""}</span>
                  </div>
                  <ExternalLink size={15} />
                </a>
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}

export default AlgorithmPage;
