import TopicCard from "./TopicCard";

/** A grid of topic cards, or `empty` when there are none. */
function TopicGrid({ topics, empty }) {
  if (topics.length === 0) {
    return <div className="empty-state">{empty}</div>;
  }

  return (
    <section className="topics-grid">
      {topics.map((topic) => (
        <TopicCard topic={topic} key={topic.id} />
      ))}
    </section>
  );
}

export default TopicGrid;
