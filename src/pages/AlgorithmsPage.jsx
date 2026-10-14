import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cpu, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { firstSentence, groupByTopic } from "../algorithms/algorithmText";
import { apiRequest } from "../api/apiClient";
import { useCatalog } from "../catalog/CatalogContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

/** Loads GET /api/algorithms: { algorithms, error, retry }. */
function useAlgorithms() {
  const [result, setResult] = useState({ algorithms: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    apiRequest("/algorithms").then(
      (data) => !cancelled && setResult({ algorithms: data.algorithms, error: null }),
      (error) => !cancelled && setResult({ algorithms: null, error: error.message }),
    );

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setResult({ algorithms: null, error: null });
    setAttempt((count) => count + 1);
  };

  return { ...result, retry };
}

/** The algorithm library (the team's algorithms table), grouped by topic. */
function AlgorithmsPage() {
  useDocumentTitle("Algorithms");
  const { getTopic } = useCatalog();
  const { algorithms, error, retry } = useAlgorithms();

  let content;

  if (error) {
    content = (
      <div className="empty-state" role="alert">
        <p>
          <TriangleAlert size={16} /> {error}
        </p>
        <button type="button" className="secondary-button" onClick={retry}>
          <RefreshCw size={15} /> Try again
        </button>
      </div>
    );
  } else if (!algorithms) {
    content = (
      <p className="empty-state" role="status">
        <LoaderCircle className="viz-spin" size={16} /> Loading algorithms…
      </p>
    );
  } else {
    content = groupByTopic(algorithms).map(({ topic, algorithms: group }) => {
      // Use the topic's icon and colour, so each group matches its topic card.
      const catalogTopic = topic && getTopic(topic.id);
      const Icon = catalogTopic?.icon ?? Cpu;
      const color = catalogTopic?.color ?? "purple";

      return (
        <section className="algorithm-group" key={topic?.id ?? "other"}>
          <div className="algorithm-group-heading">
            <h2>{topic ? topic.title : "Other algorithms"}</h2>
            {topic && (
              <Link className="text-button" to={`/topics/${topic.id}`}>
                Open the topic
              </Link>
            )}
          </div>

          <div className="progress-list">
            {group.map((algorithm) => (
              <Link className="progress-row" to={`/algorithms/${algorithm.id}`} key={algorithm.id}>
                <span className={`topic-icon ${color}`}>
                  <Icon size={19} />
                </span>

                <div className="progress-row-main">
                  <div className="progress-row-top">
                    <strong>{algorithm.name}</strong>
                  </div>
                  <span className="progress-row-detail">{firstSentence(algorithm.description)}</span>
                </div>

                {algorithm.complexity?.average && (
                  <span className="algorithm-complexity" title="Average time">
                    {algorithm.complexity.average}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      );
    });
  }

  return (
    <div className="page">
      <section className="page-heading">
        <span className="eyebrow">LIBRARY</span>
        <h1>Algorithms</h1>
        <p>
          {algorithms
            ? `${algorithms.length} algorithms, each with its steps, a worked example, C++ code and the output it prints.`
            : "Each algorithm with its steps, a worked example, C++ code and the output it prints."}
        </p>
      </section>

      {content}
    </div>
  );
}

export default AlgorithmsPage;
