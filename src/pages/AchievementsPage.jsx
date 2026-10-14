import { useState } from "react";
import { Lock } from "lucide-react";
import { useCatalog } from "../catalog/CatalogContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { evaluateAchievements } from "../learning/achievements";
import { formatDate } from "../learning/format";
import { useLearning } from "../learning/LearningContext";
import { getLearningStats } from "../learning/learningStore";

function AchievementCard({ achievement }) {
  const { icon: Icon, title, description, color, unlocked, unlockedAt, current, target } =
    achievement;

  return (
    <article className={`achievement-card ${unlocked ? "unlocked" : "locked"}`}>
      <div className="achievement-top">
        <span className={`achievement-icon ${unlocked ? `stat-icon ${color}` : ""}`}>
          <Icon size={22} />
        </span>
        {!unlocked && <Lock className="achievement-lock" size={15} aria-label="Locked" />}
      </div>

      <h3>{title}</h3>
      <p>{description}</p>

      {unlocked ? (
        <span className="achievement-status">
          Unlocked {unlockedAt ? formatDate(unlockedAt) : "just now"}
        </span>
      ) : (
        <>
          <div
            className="progress-bar"
            role="progressbar"
            aria-label={`${title} progress`}
            aria-valuenow={current}
            aria-valuemin={0}
            aria-valuemax={target}
          >
            <span style={{ width: `${(current / target) * 100}%` }} />
          </div>
          <span className="achievement-status">
            {current} / {target}
          </span>
        </>
      )}
    </article>
  );
}

function AchievementsPage() {
  useDocumentTitle("Achievements");
  const { topics, problems } = useCatalog();
  const { state } = useLearning();
  const [now] = useState(() => Date.now());
  const achievements = evaluateAchievements(
    getLearningStats(topics, problems, state, now),
    state.achievements,
  );
  const unlocked = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <div className="page">
      <section className="page-heading">
        <span className="eyebrow">YOUR JOURNEY</span>
        <h1>Achievements</h1>
        <p>
          {unlocked} of {achievements.length} unlocked. They unlock by themselves as you
          learn, and stay unlocked for good.
        </p>
      </section>

      <div
        className="progress-bar achievements-total"
        role="progressbar"
        aria-label="Achievements unlocked"
        aria-valuenow={unlocked}
        aria-valuemin={0}
        aria-valuemax={achievements.length}
      >
        <span style={{ width: `${(unlocked / achievements.length) * 100}%` }} />
      </div>

      <section className="achievement-grid">
        {achievements.map((achievement) => (
          <AchievementCard achievement={achievement} key={achievement.id} />
        ))}
      </section>
    </div>
  );
}

export default AchievementsPage;
