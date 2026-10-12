import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import TopicGrid from "../components/TopicGrid";
import { topics } from "../data/topics";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLearning } from "../learning/LearningContext";
import { getSavedTopics } from "../learning/learningStore";

function BookmarksPage() {
  useDocumentTitle("Saved topics");
  const { state } = useLearning();
  const savedTopics = getSavedTopics(topics, state);

  return (
    <div className="page">
      <section className="page-heading">
        <span className="eyebrow">YOUR LIBRARY</span>
        <h1>Saved topics</h1>
        <p>Topics you bookmarked to revisit later, newest first.</p>
      </section>

      <TopicGrid
        topics={savedTopics}
        empty={
          <>
            <p>
              Nothing saved yet. Press the <Bookmark size={14} aria-label="bookmark" />{" "}
              button on any topic to keep it here.
            </p>
            <Link className="text-button" to="/topics">
              Browse topics
            </Link>
          </>
        }
      />
    </div>
  );
}

export default BookmarksPage;
