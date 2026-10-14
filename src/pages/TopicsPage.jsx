import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Bookmark, X } from "lucide-react";
import FilterSelect from "../components/FilterSelect";
import TopicGrid from "../components/TopicGrid";
import { useCatalog } from "../catalog/CatalogContext";
import { filterTopics, getFilterOptions, searchTopics } from "../data/topicSearch";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLearning } from "../learning/LearningContext";

// A link with ?level=Expert must not hide every topic: ignore unknown values.
const pick = (value, allowed) => (allowed.includes(value) ? value : "");

/**
 * Every topic, narrowed by the header search and by filters. Filters live in
 * the URL (?level=Beginner&saved=1), so refresh, back and shared links keep them.
 */
function TopicsPage({ search, onSearchChange }) {
  useDocumentTitle("All topics");
  const { topics } = useCatalog();
  const options = useMemo(() => getFilterOptions(topics), [topics]);
  const [params, setParams] = useSearchParams();
  const { state } = useLearning();

  const filters = {
    category: pick(params.get("category"), options.categories),
    level: pick(params.get("level"), options.levels),
    structure: pick(params.get("structure"), options.structures),
    savedOnly: params.get("saved") === "1",
  };
  const query = search.trim();
  const results = filterTopics(searchTopics(topics, query), filters, state.bookmarks);
  const filtersActive =
    Boolean(filters.category || filters.level || filters.structure) || filters.savedOnly;

  function setFilter(key, value) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }

  function clearAll() {
    setParams({}, { replace: true });
    onSearchChange("");
  }

  return (
    <div className="page">
      <section className="page-heading">
        <span className="eyebrow">BROWSE</span>
        <h1>All topics</h1>
        <p>
          {query
            ? `Results for "${query}". Press Esc in the search box to clear it.`
            : "Search from the header (press /), or narrow the list with the filters."}
        </p>
      </section>

      <div className="filter-bar" role="group" aria-label="Filter topics">
        <FilterSelect
          label="Category"
          value={filters.category}
          choices={options.categories}
          onChange={(value) => setFilter("category", value)}
        />
        <FilterSelect
          label="Difficulty"
          value={filters.level}
          choices={options.levels}
          onChange={(value) => setFilter("level", value)}
        />
        <FilterSelect
          label="Data structure"
          value={filters.structure}
          choices={options.structures}
          onChange={(value) => setFilter("structure", value)}
        />

        <button
          type="button"
          className={`filter-toggle ${filters.savedOnly ? "on" : ""}`}
          aria-pressed={filters.savedOnly}
          onClick={() => setFilter("saved", filters.savedOnly ? "" : "1")}
        >
          <Bookmark size={15} />
          Saved only
        </button>

        <div className="filter-summary">
          <span aria-live="polite">
            {results.length} of {topics.length} topics
          </span>
          {(filtersActive || query) && (
            <button type="button" className="text-button" onClick={clearAll}>
              <X size={15} />
              Clear all
            </button>
          )}
        </div>
      </div>

      <TopicGrid
        topics={results}
        empty={
          <>
            <p>No topics match {query ? `"${query}" with ` : ""}these filters.</p>
            <button type="button" className="text-button" onClick={clearAll}>
              Clear search and filters
            </button>
          </>
        }
      />
    </div>
  );
}

export default TopicsPage;
