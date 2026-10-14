import { useEffect, useId, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Search, X } from "lucide-react";
import NotificationsMenu from "./NotificationsMenu";
import ProfileMenu from "./ProfileMenu";
import { useCatalog } from "../catalog/CatalogContext";
import { searchTopics } from "../data/topicSearch";

const MAX_SUGGESTIONS = 6;

// Is the user typing in a field? Then "/" is just a character.
function isTypingTarget(element) {
  return (
    element.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName)
  );
}

// Keeps focus in the search box when a result is clicked, so it doesn't close first.
const keepFocus = (event) => event.preventDefault();

function Header({ search, onSearchChange }) {
  const { topics } = useCatalog();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const inputRef = useRef(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const query = search.trim();
  const matches = query ? searchTopics(topics, query) : [];
  const suggestions = matches.slice(0, MAX_SUGGESTIONS);
  // On the topics page, the grid below already shows the results.
  const showPanel = open && query !== "" && pathname !== "/topics";

  // Press "/" anywhere to jump to the search box.
  useEffect(() => {
    function handleShortcut(event) {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;

      event.preventDefault();
      inputRef.current?.focus();
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  function openTopic(topic) {
    onSearchChange("");
    setOpen(false);
    inputRef.current?.blur();
    navigate(`/topics/${topic.id}`);
  }

  function showAllResults() {
    setOpen(false);
    navigate("/topics");
  }

  function handleKeyDown(event) {
    const count = suggestions.length;

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && showPanel && count > 0) {
      event.preventDefault();
      setHighlight((index) =>
        event.key === "ArrowDown"
          ? (index + 1) % count
          : (index - 1 + count) % count,
      );
    } else if (event.key === "Enter" && query) {
      event.preventDefault();
      if (showPanel && suggestions[highlight]) openTopic(suggestions[highlight]);
      else showAllResults();
    } else if (event.key === "Escape") {
      // First Escape closes the list, the second clears the search.
      if (showPanel) setOpen(false);
      else onSearchChange("");
    }
  }

  return (
    <header className="header">
      <div className="search">
        <label className="search-box">
          <Search size={17} strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-label="Search topics"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              showPanel && highlight >= 0 ? `${listId}-${highlight}` : undefined
            }
            placeholder="Search topics and algorithms..."
            value={search}
            onChange={(event) => {
              onSearchChange(event.target.value);
              setOpen(true);
              setHighlight(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={handleKeyDown}
          />

          {search ? (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onMouseDown={keepFocus}
              onClick={() => {
                onSearchChange("");
                inputRef.current?.focus();
              }}
            >
              <X size={15} />
            </button>
          ) : (
            <kbd className="search-shortcut" title="Press / to search">
              /
            </kbd>
          )}
        </label>

        {showPanel && (
          <div className="search-panel">
            {suggestions.length > 0 ? (
              <ul className="search-results" id={listId} role="listbox" aria-label="Matching topics">
                {suggestions.map((topic, index) => {
                  const Icon = topic.icon;

                  return (
                    <li
                      key={topic.id}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={index === highlight}
                      className={`search-result ${index === highlight ? "highlighted" : ""}`}
                      onMouseDown={keepFocus}
                      onMouseEnter={() => setHighlight(index)}
                      onClick={() => openTopic(topic)}
                    >
                      <span className={`topic-icon small ${topic.color}`}>
                        <Icon size={15} />
                      </span>
                      <span className="search-result-text">
                        <strong>{topic.title}</strong>
                        <span>
                          {topic.category} · {topic.level}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="search-empty">No topics match "{query}".</p>
            )}

            <button
              type="button"
              className="search-all"
              onMouseDown={keepFocus}
              onClick={showAllResults}
            >
              {matches.length > 0
                ? `See all ${matches.length} ${matches.length === 1 ? "result" : "results"}`
                : "Browse all topics"}
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="header-actions">
        <NotificationsMenu />
        <ProfileMenu />
      </div>
    </header>
  );
}

export default Header;
