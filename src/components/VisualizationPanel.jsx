import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import PlanPreview from "./PlanPreview";
import { useLearning } from "../learning/LearningContext";
import { PLAYBACK_SPEEDS } from "../learning/learningStore";
import {
  readCachedVisualization,
  requestVisualization,
} from "../pages/service/visualizationClient";
import { replayPlan } from "../pages/service/visualizationReplay";
import "./VisualizationPanel.css";

function sourceLabel(result) {
  if (result.source === "sample") return "Built-in sample";

  // "nvidia/nemotron-3-super-120b-a12b:free" → "nemotron-3-super-120b-a12b"
  const model = (result.plan.metadata?.model ?? "AI model").split("/").pop().replace(/:free$/, "");
  const tries = result.attempts === 1 ? "first try" : `${result.attempts} tries`;

  return `AI · ${model} · ${tries}${result.saved ? " · saved" : ""}`;
}

/**
 * Asks the analyzer for this topic's plan and steps through it.
 * Render it with key={topic.id} so switching topics starts fresh.
 */
function VisualizationPanel({ topic }) {
  const [result, setResult] = useState(() => {
    const saved = readCachedVisualization(topic);
    return saved ? { ...saved, saved: true } : null;
  });
  // "idle" → "loading" → "ready" or "error"
  const [status, setStatus] = useState(result ? "ready" : "idle");
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const controllerRef = useRef(null);
  const { recordStep, state: learning } = useLearning();
  // Settings → Visualization speed.
  const playInterval = PLAYBACK_SPEEDS[learning.preferences.playbackSpeed];

  const frames = useMemo(() => (result ? replayPlan(result.plan) : []), [result]);
  const steps = result?.plan.steps ?? [];
  const lastStep = steps.length - 1;
  const isPlaying = playing && stepIndex < lastStep;

  // Stop waiting for the server when the panel goes away.
  useEffect(() => () => controllerRef.current?.abort(), []);

  // Remember the furthest step watched; it counts towards topic progress.
  useEffect(() => {
    if (status === "ready") recordStep(topic.id, stepIndex, steps.length);
  }, [status, stepIndex, steps.length, topic.id, recordStep]);

  // Count the seconds while the AI works, because it can take a minute or two.
  useEffect(() => {
    if (status !== "loading") return undefined;

    const started = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - started) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Autoplay: one step forward every playInterval until the last step.
  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = setTimeout(() => setStepIndex((index) => index + 1), playInterval);

    return () => clearTimeout(timer);
  }, [isPlaying, stepIndex, playInterval]);

  async function generate() {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus("loading");
    setError(null);
    setElapsed(0);
    setPlaying(false);

    try {
      const next = await requestVisualization(topic, { signal: controller.signal });

      if (next.plan) {
        setResult(next);
        setStepIndex(0);
        setStatus("ready");
      } else {
        setError({
          message: "The AI couldn't build a valid visualization for this topic.",
          details: next.errors,
        });
        setStatus("error");
      }
    } catch (requestError) {
      if (controller.signal.aborted) return;

      setError({ message: requestError.message, details: [] });
      setStatus("error");
    }
  }

  function goTo(index) {
    setPlaying(false);
    setStepIndex(index);
  }

  function togglePlay() {
    if (isPlaying) {
      setPlaying(false);
      return;
    }

    if (stepIndex >= lastStep) setStepIndex(0);
    setPlaying(true);
  }

  return (
    <section className="topic-panel visualization-panel">
      <div className="topic-section-heading">
        <div className="topic-heading-icon purple">
          <Sparkles size={19} />
        </div>
        <div className="visualization-heading-text">
          <h2>AI visualization</h2>
          <p>AI turns this topic into a step-by-step animation</p>
        </div>
        {status === "ready" && (
          <button className="viz-button ghost" type="button" onClick={generate}>
            <RefreshCw size={15} />
            Regenerate
          </button>
        )}
      </div>

      {status === "idle" && (
        <div className="viz-empty">
          <p>
            Ask the AI to design an animated walkthrough of {topic.title}. It
            usually takes under a minute or two.
          </p>
          <button className="viz-button primary" type="button" onClick={generate}>
            <Sparkles size={16} />
            Generate visualization
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="viz-loading" role="status">
          <LoaderCircle className="viz-spin" size={22} />
          <div>
            <strong>The AI is designing the visualization… {elapsed}s</strong>
            <span>Every plan is checked by the validator and repaired if needed.</span>
          </div>
        </div>
      )}

      {status === "error" && (
        <div className="viz-error" role="alert">
          <TriangleAlert size={19} />
          <div>
            <strong>{error.message}</strong>
            {error.details.length > 0 && (
              <details>
                <summary>Show details</summary>
                <ul>
                  {error.details.map((detail, index) => (
                    <li key={index}>{detail}</li>
                  ))}
                </ul>
              </details>
            )}
            <button className="viz-button primary" type="button" onClick={generate}>
              <RefreshCw size={15} />
              Try again
            </button>
          </div>
        </div>
      )}

      {status === "ready" && (
        <>
          <div className="viz-meta">
            <strong>{result.plan.title}</strong>
            <span className={`viz-badge ${result.source}`}>{sourceLabel(result)}</span>
          </div>

          {result.source === "sample" && (
            <details className="viz-notice">
              <summary>The AI plan wasn't usable, so this is the built-in sample.</summary>
              <ul>
                {result.errors.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </details>
          )}

          <PlanPreview frames={frames} index={stepIndex} />

          <p className="viz-step-text" aria-live="polite">
            <span className="step-number">{stepIndex + 1}</span>
            <span>{steps[stepIndex].description}</span>
          </p>

          <div className="viz-controls">
            <button
              className="viz-icon-button"
              type="button"
              onClick={() => goTo(stepIndex - 1)}
              disabled={stepIndex === 0}
              aria-label="Previous step"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="viz-icon-button play"
              type="button"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={17} /> : <Play size={17} />}
            </button>
            <button
              className="viz-icon-button"
              type="button"
              onClick={() => goTo(stepIndex + 1)}
              disabled={stepIndex === lastStep}
              aria-label="Next step"
            >
              <ChevronRight size={18} />
            </button>
            <input
              type="range"
              min={0}
              max={lastStep}
              value={stepIndex}
              onChange={(event) => goTo(Number(event.target.value))}
              aria-label="Step"
            />
            <span className="viz-counter">
              {stepIndex + 1} / {steps.length}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default VisualizationPanel;
