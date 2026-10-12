import {
  Target,
  BookOpen,
  Code2,
  Flame,
  ArrowUpRight,
  Play,
} from "lucide-react";
import { Link } from "react-router-dom";
import TopicCard from "../components/TopicCard";
import { topics } from "../data/topics";

const exploredCount = topics.filter((topic) => topic.progress > 0).length;

// "Continue learning" opens the first topic that is started but not finished.
const nextTopic =
  topics.find((topic) => topic.progress > 0 && topic.progress < 100) ??
  topics[0];

const stats = [
  {
    label: "Topics explored",
    value: String(exploredCount).padStart(2, "0"),
    detail: "Start exploring more",
    icon: BookOpen,
    color: "purple",
  },
  {
    label: "Problems solved",
    value: "12",
    detail: "Keep the momentum",
    icon: Code2,
    color: "blue",
  },
  {
    label: "Learning streak",
    value: "4 days",
    detail: "You're building a habit",
    icon: Flame,
    color: "orange",
  },
];

function Dashboard({ search }) {
  const query = search.trim().toLowerCase();
  const visibleTopics = topics.filter((topic) =>
    `${topic.title} ${topic.description}`.toLowerCase().includes(query),
  );

  return (
    <div className="dashboard">
      <section className="hero-card">
        <div className="hero-content">
          <span className="hero-label">
            <Target size={14} /> YOUR NEXT MILESTONE
          </span>

          <h2>Small steps.<br />Big breakthroughs.</h2>

          <p>
            Build your DSA foundations one concept at a time.
            Your next breakthrough starts here.
          </p>

          <Link className="primary-button" to={`/topics/${nextTopic.id}`}>
            <Play size={16} fill="currentColor" />
            Continue learning
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
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article className="stat-card" key={stat.label}>
              <div className="stat-top">
                <div className={`stat-icon ${stat.color}`}>
                  <Icon size={19} />
                </div>

                <ArrowUpRight size={17} className="stat-arrow" />
              </div>

              <p className="stat-label">{stat.label}</p>
              <h3>{stat.value}</h3>
              <span className="stat-detail">{stat.detail}</span>
            </article>
          );
        })}
      </section>

      <section className="topics-heading">
        <div>
          <span className="eyebrow">YOUR LEARNING PATH</span>
          <h2>Explore DSA</h2>
          <p>Choose a topic and start building your understanding.</p>
        </div>

        <button className="text-button">
          View all topics <ArrowUpRight size={16} />
        </button>
      </section>

      {visibleTopics.length > 0 ? (
        <section className="topics-grid">
          {visibleTopics.map((topic) => (
            <TopicCard topic={topic} key={topic.id} />
          ))}
        </section>
      ) : (
        <p className="empty-state">No topics match "{search}".</p>
      )}
    </div>
  );
}

export default Dashboard;
