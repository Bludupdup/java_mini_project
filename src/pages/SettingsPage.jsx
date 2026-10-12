import { useRef, useState } from "react";
import {
  Download,
  GraduationCap,
  HardDrive,
  LogOut,
  RotateCcw,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react";
import { useAuth } from "../auth/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useLearning } from "../learning/LearningContext";
import {
  MAX_NAME_LENGTH,
  PLAYBACK_SPEEDS,
  sanitizeLearningState,
  toDayKey,
} from "../learning/learningStore";
import {
  clearCachedVisualizations,
  countCachedVisualizations,
} from "./service/visualizationClient";

const EXPORT_APP = "dsa-universe";
const SPEED_LABELS = { slow: "Slow", normal: "Normal", fast: "Fast" };

function hasAnyProgress(state) {
  return (
    state.bookmarks.length > 0 ||
    Object.keys(state.topics).length > 0 ||
    Object.keys(state.problems).length > 0 ||
    state.activityDays.length > 0
  );
}

function SettingsSection({ icon: Icon, title, description, children }) {
  return (
    <section className="panel settings-section">
      <div className="panel-heading">
        <span className="stat-icon purple">
          <Icon size={19} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingsPage() {
  useDocumentTitle("Settings");
  const { state, setPreferences, importState, resetProgress, resetEverything } = useLearning();
  const { user, logOut } = useAuth();
  const { name, playbackSpeed, reduceMotion } = state.preferences;
  const [message, setMessage] = useState(null); // { kind: "success" | "error", text }
  const [cachedPlans, setCachedPlans] = useState(() => countCachedVisualizations());
  const fileInputRef = useRef(null);

  function exportData() {
    const file = { app: EXPORT_APP, version: 1, exportedAt: new Date().toISOString(), data: state };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");

    link.href = url;
    link.download = `dsa-universe-progress-${toDayKey(Date.now())}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage({ kind: "success", text: "Your progress file has been downloaded." });
  }

  async function importData(event) {
    const [file] = event.target.files;
    // Clear it, so choosing the same file again still triggers a change.
    event.target.value = "";
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const data = sanitizeLearningState(parsed?.app === EXPORT_APP ? parsed.data : parsed);

      if (!hasAnyProgress(data)) {
        setMessage({ kind: "error", text: "That file has no DSA Universe progress in it." });
        return;
      }
      if (!window.confirm("Replace your current progress with the imported file?")) return;

      importState(data);
      setMessage({ kind: "success", text: "Progress imported." });
    } catch {
      setMessage({ kind: "error", text: "That file isn't a valid progress export (JSON)." });
    }
  }

  function clearPlans() {
    const removed = clearCachedVisualizations();
    setCachedPlans(countCachedVisualizations());
    setMessage({
      kind: "success",
      text: `Removed ${removed} saved ${removed === 1 ? "visualization" : "visualizations"}.`,
    });
  }

  function confirmThen(question, action, done) {
    if (!window.confirm(question)) return;
    action();
    setMessage({ kind: "success", text: done });
  }

  return (
    <div className="page settings-page">
      <section className="page-heading">
        <span className="eyebrow">SETTINGS</span>
        <h1>Settings</h1>
        <p>Your profile, how the app behaves, and the data it keeps in this browser.</p>
      </section>

      <SettingsSection icon={UserRound} title="Account" description="Who is logged in, and how the app greets you.">
        <div className="account-row">
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <button type="button" className="secondary-button" onClick={logOut}>
            <LogOut size={15} />
            Log out
          </button>
        </div>

        <label className="settings-field">
          <span>Display name</span>
          <input
            type="text"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            placeholder={user.name}
            autoComplete="nickname"
            onChange={(event) => setPreferences({ name: event.target.value })}
          />
          <small>
            Shown on the dashboard and as your initials in the top corner. Leave it empty
            to use your account name.
          </small>
        </label>
      </SettingsSection>

      <SettingsSection
        icon={GraduationCap}
        title="Learning"
        description="How visualizations and animations behave."
      >
        <fieldset className="settings-field">
          <legend>Visualization speed</legend>
          <div className="segmented">
            {Object.keys(PLAYBACK_SPEEDS).map((speed) => (
              <label className={`segment ${playbackSpeed === speed ? "active" : ""}`} key={speed}>
                <input
                  type="radio"
                  name="playback-speed"
                  value={speed}
                  checked={playbackSpeed === speed}
                  onChange={() => setPreferences({ playbackSpeed: speed })}
                />
                {SPEED_LABELS[speed]}
              </label>
            ))}
          </div>
          <small>How long each step stays on screen when you press Play.</small>
        </fieldset>

        <label className="settings-toggle">
          <input
            type="checkbox"
            checked={reduceMotion}
            onChange={(event) => setPreferences({ reduceMotion: event.target.checked })}
          />
          <span className="switch" aria-hidden="true" />
          <span>
            <strong>Reduce motion</strong>
            <small>Turn off sliding, fading and spinning animations across the app.</small>
          </span>
        </label>
      </SettingsSection>

      <SettingsSection
        icon={HardDrive}
        title="Your data"
        description="Your progress is stored in this browser, separately for each account. Export it to keep a backup or move to another device."
      >
        <div className="settings-actions">
          <button type="button" className="secondary-button" onClick={exportData}>
            <Download size={15} />
            Export progress
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => fileInputRef.current.click()}
          >
            <Upload size={15} />
            Import progress
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={importData}
          />
          <button
            type="button"
            className="secondary-button"
            onClick={clearPlans}
            disabled={cachedPlans === 0}
          >
            <Trash2 size={15} />
            Clear saved visualizations ({cachedPlans})
          </button>
        </div>

        <div className="settings-actions danger-zone">
          <button
            type="button"
            className="danger-button"
            onClick={() =>
              confirmThen(
                "Reset progress, solved problems and achievements? Saved topics, notes and preferences are kept.",
                resetProgress,
                "Progress reset.",
              )
            }
          >
            <RotateCcw size={15} />
            Reset progress
          </button>
          <button
            type="button"
            className="danger-button"
            onClick={() =>
              confirmThen(
                "Erase everything, including saved topics, notes and preferences? This can't be undone.",
                resetEverything,
                "Everything has been erased.",
              )
            }
          >
            <Trash2 size={15} />
            Erase everything
          </button>
        </div>

        {message && (
          <p className={`settings-message ${message.kind}`} role="status">
            {message.text}
          </p>
        )}
      </SettingsSection>
    </div>
  );
}

export default SettingsPage;
