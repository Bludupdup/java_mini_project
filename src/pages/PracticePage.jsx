import { useId, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CircleCheckBig,
  ExternalLink,
  Mountain,
  NotebookPen,
  Search,
  Sprout,
  X,
} from "lucide-react";
import FilterSelect from "../components/FilterSelect";
import SolvedButton from "../components/SolvedButton";
import StatCard from "../components/StatCard";
import { PROBLEM_DIFFICULTIES, problems } from "../data/problems";
import { topics } from "../data/topics";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { formatDate } from "../learning/format";
import { useLearning } from "../learning/LearningContext";
import { MAX_NOTE_LENGTH } from "../learning/learningStore";

const TOPIC_CHOICES = topics
  .filter((topic) => problems.some((problem) => problem.topicId === topic.id))
  .map((topic) => ({ value: topic.id, label: topic.title }));
const DIFFICULTY_CHOICES = PROBLEM_DIFFICULTIES.filter((difficulty) =>
  problems.some((problem) => problem.difficulty === difficulty),
);
const STATUS_CHOICES = [
  { value: "todo", label: "To do" },
  { value: "solved", label: "Solved" },
];

// Unknown values in the URL are ignored instead of hiding every problem.
const pick = (value, choices) =>
  choices.some((choice) => (choice.value ?? choice) === value) ? value : "";

function ProblemRow({ problem }) {
  const { state, setNote } = useLearning();
  const record = state.problems[problem.id];
  const savedNote = record?.note ?? "";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(savedNote);
  const noteId = useId();

  function toggleNote() {
    // Start from the saved note: it may have changed in another tab or by import.
    if (!open) setDraft(savedNote);
    setOpen(!open);
  }

  return (
    <li className={`problem-row ${record?.solvedAt ? "solved" : ""}`}>
      <div className="problem-row-main">
        <SolvedButton problem={problem} />

        <div className="problem-row-text">
          <a className="problem-title" href={problem.url} target="_blank" rel="noreferrer">
            {problem.title}
            <ExternalLink size={13} />
          </a>
          <span className="problem-meta">
            <Link to={`/topics/${problem.topicId}`}>{problem.topicTitle}</Link>
            {" · "}
            {problem.platform}
            {record?.solvedAt && ` · Solved ${formatDate(record.solvedAt)}`}
          </span>
        </div>

        <span className={`difficulty-chip ${problem.difficulty.toLowerCase()}`}>
          {problem.difficulty}
        </span>

        <button
          type="button"
          className={`note-button ${savedNote ? "has-note" : ""}`}
          aria-expanded={open}
          aria-controls={noteId}
          onClick={toggleNote}
        >
          <NotebookPen size={15} />
          <span>{savedNote ? "Note" : "Add note"}</span>
        </button>
      </div>

      {open ? (
        <div className="problem-note" id={noteId}>
          <textarea
            value={draft}
            maxLength={MAX_NOTE_LENGTH}
            rows={3}
            placeholder="Your approach, tricky cases, time and space complexity..."
            aria-label={`Note for ${problem.title}`}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => setNote(problem.id, draft)}
            autoFocus
          />
          <small>Saved automatically when you click away.</small>
        </div>
      ) : (
        savedNote && <p className="problem-note-preview">{savedNote}</p>
      )}
    </li>
  );
}

function PracticePage() {
  useDocumentTitle("Practice");
  const [params, setParams] = useSearchParams();
  const { state } = useLearning();

  const filters = {
    topic: pick(params.get("topic"), TOPIC_CHOICES),
    difficulty: pick(params.get("difficulty"), DIFFICULTY_CHOICES),
    status: pick(params.get("status"), STATUS_CHOICES),
    query: params.get("q") ?? "",
  };
  const isSolved = (problem) => Boolean(state.problems[problem.id]?.solvedAt);
  const words = filters.query.trim().toLowerCase();

  const results = problems.filter(
    (problem) =>
      (!filters.topic || problem.topicId === filters.topic) &&
      (!filters.difficulty || problem.difficulty === filters.difficulty) &&
      (!filters.status || isSolved(problem) === (filters.status === "solved")) &&
      (!words || `${problem.title} ${problem.topicTitle}`.toLowerCase().includes(words)),
  );
  const filtersActive = Object.values(filters).some(Boolean);

  const count = (difficulty) => {
    const ofLevel = problems.filter((problem) => problem.difficulty === difficulty);
    return `${ofLevel.filter(isSolved).length}/${ofLevel.length}`;
  };
  const solvedCount = problems.filter(isSolved).length;

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

  return (
    <div className="page">
      <section className="page-heading">
        <span className="eyebrow">PRACTICE</span>
        <h1>Practice problems</h1>
        <p>
          Hand-picked problems for every topic. Solve them on LeetCode, then tick them
          off here and keep notes on how you solved them.
        </p>
      </section>

      <section className="stats-grid">
        <StatCard
          label="Problems solved"
          value={`${solvedCount}/${problems.length}`}
          detail={solvedCount === problems.length ? "Every problem solved!" : "Keep practising"}
          icon={CircleCheckBig}
          color="purple"
        />
        <StatCard
          label="Easy"
          value={count("Easy")}
          detail="Warm-ups for each pattern"
          icon={Sprout}
          color="green"
        />
        <StatCard
          label="Medium"
          value={count("Medium")}
          detail="Where interviews usually start"
          icon={Mountain}
          color="orange"
        />
      </section>

      <div className="filter-bar" role="group" aria-label="Filter problems">
        <label className="filter-search">
          <span>Find a problem</span>
          <span className="filter-search-box">
            <Search size={15} />
            <input
              type="text"
              value={filters.query}
              placeholder="e.g. two sum"
              onChange={(event) => setFilter("q", event.target.value)}
            />
          </span>
        </label>
        <FilterSelect
          label="Topic"
          value={filters.topic}
          choices={TOPIC_CHOICES}
          onChange={(value) => setFilter("topic", value)}
        />
        <FilterSelect
          label="Difficulty"
          value={filters.difficulty}
          choices={DIFFICULTY_CHOICES}
          onChange={(value) => setFilter("difficulty", value)}
        />
        <FilterSelect
          label="Status"
          value={filters.status}
          choices={STATUS_CHOICES}
          onChange={(value) => setFilter("status", value)}
        />

        <div className="filter-summary">
          <span aria-live="polite">
            {results.length} of {problems.length} problems
          </span>
          {filtersActive && (
            <button
              type="button"
              className="text-button"
              onClick={() => setParams({}, { replace: true })}
            >
              <X size={15} />
              Clear all
            </button>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <ul className="problem-list">
          {results.map((problem) => (
            <ProblemRow problem={problem} key={problem.id} />
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <p>No problems match these filters.</p>
          <button
            type="button"
            className="text-button"
            onClick={() => setParams({}, { replace: true })}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}

export default PracticePage;
