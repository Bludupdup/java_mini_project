import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleCheckBig,
  Code2,
  Flame,
  RotateCcw,
} from "lucide-react";
import StatCard from "../components/StatCard";
import { getTopicProblems, problems } from "../data/problems";
import { topics } from "../data/topics";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatDate, plural } from "../learning/format";
import { useLearning } from "../learning/LearningContext";
import {
  getLearningStats,
  getTopicProgress,
  STATUS_LABELS,
} from "../learning/learningStore";

// "Visualization 8/18 steps · Problems 1/3 · Opened 11 Oct", for example.
function describe(topic, state) {
  const record = state.topics[topic.id];
  const topicProblems = getTopicProblems(topic.id);
  const solved = topicProblems.filter((problem) => state.problems[problem.id]?.solvedAt);
  const parts = [];

  parts.push(
    record?.visualization
      ? `Visualization ${record.visualization.seen}/${record.visualization.total} steps`
      : "Visualization not watched yet",
  );
  if (topicProblems.length > 0) parts.push(`Problems ${solved.length}/${topicProblems.length}`);
  if (record?.completedAt) parts.push(`Completed ${formatDate(record.completedAt)}`);
  else if (record?.visitedAt) parts.push(`Opened ${formatDate(record.visitedAt)}`);
  else parts.push("Not opened yet");

  return parts.join(" · ");
}

function ProgressPage() {
  useDocumentTitle("Progress");
  const { state, resetProgress } = useLearning();
  // Read the clock once per visit, not on every render.
  const [now] = useState(() => Date.now());
  const stats = getLearningStats(topics, problems, state, now);
  const hasProgress = stats.explored > 0 || stats.solved > 0 || stats.activeDays > 0;

  function handleReset() {
    const question =
      "Reset progress, solved problems and achievements? Saved topics, notes and preferences are kept.";

    if (window.confirm(question)) resetProgress();
  }

  return (
    <div className="page">
      <section className="topics-heading">
        <div>
          <span className="eyebrow">YOUR JOURNEY</span>
          <h1>Learning progress</h1>
          <p>
            Opening a topic counts 10%, watching its visualization up to 90%, and marking
            it complete makes it 100%.
          </p>
        </div>

        <Link className="text-button" to="/achievements">
          See achievements <ArrowUpRight size={16} />
        </Link>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Overall progress"
          value={`${stats.percent}%`}
          detail={`${stats.explored} of ${stats.totalTopics} topics started`}
          icon={ChartNoAxesCombined}
          color="purple"
        />
        <StatCard
          label="Topics completed"
          value={`${stats.completed}/${stats.totalTopics}`}
          detail={stats.completed === stats.totalTopics ? "Everything done!" : "Keep going"}
          icon={CircleCheckBig}
          color="blue"
        />
        <StatCard
          label="Problems solved"
          value={`${stats.solved}/${stats.totalProblems}`}
          detail={`${stats.solvedMedium} Medium or harder`}
          icon={Code2}
          color="green"
          to="/practice"
        />
        <StatCard
          label="Learning streak"
          value={plural(stats.streak, "day")}
          detail={`Best: ${plural(stats.bestStreak, "day")} · ${plural(stats.activeDays, "active day")}`}
          icon={Flame}
          color="orange"
        />
      </section>

      <section className="progress-list" aria-label="Progress per topic">
        {topics.map((topic) => {
          const Icon = topic.icon;
          const { status, percent } = getTopicProgress(state.topics[topic.id]);

          return (
            <Link className="progress-row" to={`/topics/${topic.id}`} key={topic.id}>
              <span className={`topic-icon ${topic.color}`}>
                <Icon size={19} />
              </span>

              <div className="progress-row-main">
                <div className="progress-row-top">
                  <strong>{topic.title}</strong>
                  <span className={`status-badge ${status}`}>{STATUS_LABELS[status]}</span>
                </div>

                <div
                  className={`progress-bar ${status}`}
                  role="progressbar"
                  aria-label={`${topic.title} progress`}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <span style={{ width: `${percent}%` }} />
                </div>

                <span className="progress-row-detail">{describe(topic, state)}</span>
              </div>

              <span className="progress-row-percent">{percent}%</span>
            </Link>
          );
        })}
      </section>

      {hasProgress && (
        <button type="button" className="danger-button" onClick={handleReset}>
          <RotateCcw size={15} />
          Reset progress
        </button>
      )}
    </div>
  );
}

export default ProgressPage;
