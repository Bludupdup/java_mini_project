import { useState } from "react";
import {
  Target,
  CircleCheckBig,
  Code2,
  Flame,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import TopicGrid from "../components/TopicGrid";
import { problems } from "../data/problems";
import { topics } from "../data/topics";
import { useAuth } from "../auth/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { plural } from "../learning/format";
import { useLearning } from "../learning/LearningContext";
import {
  getLearningStats,
  getNextTopic,
  getSavedTopics,
} from "../learning/learningStore";

const SAVED_PREVIEW_COUNT = 3;

function Dashboard() {
  useDocumentTitle("Dashboard");
  const { state } = useLearning();
  const { user } = useAuth();
  // Read the clock once per visit, not on every render.
  const [now] = useState(() => Date.now());
  const summary = getLearningStats(topics, problems, state, now);
  const nextTopic = getNextTopic(topics, state);
  const hasStarted = summary.explored > 0;
  const savedTopics = getSavedTopics(topics, state);
  const name = state.preferences.name || user.name;

  const stats = [
    {
      label: "Topics completed",
      value: `${summary.completed}/${summary.totalTopics}`,
      detail: summary.completed > 0 ? "Keep the momentum" : "Finish a topic to mark it complete",
      icon: CircleCheckBig,
      color: "purple",
      to: "/progress",
    },
    {
      label: "Problems solved",
      value: `${summary.solved}/${summary.totalProblems}`,
      detail: summary.solved > 0 ? "Practice makes permanent" : "Try your first practice problem",
      icon: Code2,
      color: "blue",
      to: "/practice",
    },
    {
      label: "Learning streak",
      value: plural(summary.streak, "day"),
      detail: summary.streak > 0 ? "You're building a habit" : "Learn something today to start one",
      icon: Flame,
      color: "orange",
      to: "/achievements",
    },
  ];

  return (
    <div className="dashboard">
      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-label">
            <Target size={14} /> YOUR NEXT MILESTONE
          </span>

          <h2>Small steps.<br />Big breakthroughs.</h2>

          <p>
            {name && `Welcome back, ${name}! `}
            Build your DSA foundations one concept at a time.
            {hasStarted ? ` Next up: ${nextTopic.title}.` : " Your next breakthrough starts here."}
          </p>

          <Link className="primary-button" to={`/topics/${nextTopic.id}`}>
            <Play size={16} fill="currentColor" />
            {hasStarted ? "Continue learning" : "Start learning"}
          </Link>
        </div>

        <div className="hero-decoration" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit-core">
            <Code2 size={42} />
          </div>
          <span className="floating-symbol symbol-one">{"{ }"}</span>
          <span className="floating-symbol symbol-two">{"< />"}</span>
        </div>
      </section>

      <section className="stats-grid">
        {stats.map((stat) => (
          <StatCard {...stat} key={stat.label} />
        ))}
      </section>

      {savedTopics.length > 0 && (
        <>
          <section className="topics-heading">
            <div>
              <span className="eyebrow">SAVED FOR LATER</span>
              <h2>Your bookmarks</h2>
              <p>Topics you saved to come back to.</p>
            </div>

            <Link className="text-button" to="/bookmarks">
              {savedTopics.length > SAVED_PREVIEW_COUNT
                ? `See all ${savedTopics.length}`
                : "Open saved topics"}
              <ArrowUpRight size={16} />
            </Link>
          </section>

          <div className="dashboard-section">
            <TopicGrid topics={savedTopics.slice(0, SAVED_PREVIEW_COUNT)} />
          </div>
        </>
      )}

      <section className="topics-heading">
        <div>
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>Explore DSA</h2>
          <p>Choose a topic and start building your understanding.</p>
        </div>

        <Link className="text-button" to="/topics">
          View all topics <ArrowUpRight size={16} />
        </Link>
      </section>

      <TopicGrid topics={topics} />
    </div>
  );
}

export default Dashboard;
