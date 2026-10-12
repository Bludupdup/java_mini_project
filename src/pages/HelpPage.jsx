import { Link } from "react-router-dom";
import { Keyboard, LifeBuoy, MessageCircleQuestion, Rocket } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const GETTING_STARTED = [
  { title: "Pick a topic", text: "Start from the dashboard, or search with / from anywhere." },
  { title: "Watch it happen", text: "Generate the AI visualization and step through it." },
  { title: "Practise", text: "Solve the topic's problems and tick them off in Practice." },
  { title: "Mark it complete", text: "Then watch your progress and achievements grow." },
];

const SHORTCUTS = [
  ["/", "Jump to the search box"],
  ["↑ ↓", "Move through search results"],
  ["Enter", "Open the highlighted topic, or see all results"],
  ["Esc", "Close the results; press again to clear the search"],
];

const QUESTIONS = [
  {
    question: "How is my progress calculated?",
    answer:
      "Opening a topic counts 10%. Watching its AI visualization adds up to 80% more, step by step. Marking the topic complete makes it 100%.",
  },
  {
    question: "Where is my data stored?",
    answer:
      "Your account (name, email and a scrambled version of your password, never the password itself) is kept on the app's server. Your progress is kept in this browser, separately for each account. Use Settings → Export progress to keep a backup or move to another device.",
  },
  {
    question: "How does the AI visualization work?",
    answer:
      "The server asks an AI model (through OpenRouter, or Google Gemini) for a step-by-step plan of the topic. A validator checks every step; if something is wrong, the AI gets the list of problems and tries again, up to 3 times. Topics with a built-in sample fall back to it.",
  },
  {
    question: "Why is a visualization slow, or why did it fail?",
    answer:
      "The free AI models usually take 30–90 seconds. If it fails, check that the dev server is running and the API key in .env.local is valid, then press Try again. The free plan allows 50 AI requests a day.",
  },
  {
    question: "What counts towards my streak?",
    answer:
      "Any day you open a topic, watch a visualization step, mark a topic complete or solve a practice problem.",
  },
  {
    question: "How do achievements unlock?",
    answer:
      "By themselves, the moment you reach the goal. Once unlocked they stay unlocked, even if a streak ends later.",
  },
  {
    question: "How do I start over?",
    answer:
      "Settings → Reset progress clears progress, solved problems and achievements, but keeps saved topics, notes and preferences. Erase everything clears it all.",
  },
];

function HelpPage() {
  useDocumentTitle("Help & Support");

  return (
    <div className="page help-page">
      <section className="page-heading">
        <span className="eyebrow">HELP & SUPPORT</span>
        <h1>How can we help?</h1>
        <p>Everything you need to get the most out of DSA Universe.</p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="stat-icon purple">
            <Rocket size={19} />
          </span>
          <div>
            <h2>Getting started</h2>
            <p>The learning loop in four steps.</p>
          </div>
        </div>
        <ol className="help-steps">
          {GETTING_STARTED.map((step, index) => (
            <li key={step.title}>
              <span className="step-number">{index + 1}</span>
              <span>
                <strong>{step.title}</strong>
                {step.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="stat-icon blue">
            <MessageCircleQuestion size={19} />
          </span>
          <div>
            <h2>Frequently asked questions</h2>
            <p>Click a question to see the answer.</p>
          </div>
        </div>
        <div className="faq">
          {QUESTIONS.map(({ question, answer }) => (
            <details key={question}>
              <summary>{question}</summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="stat-icon orange">
            <Keyboard size={19} />
          </span>
          <div>
            <h2>Keyboard shortcuts</h2>
            <p>Move around without the mouse.</p>
          </div>
        </div>
        <dl className="shortcuts">
          {SHORTCUTS.map(([keys, action]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel help-contact">
        <span className="stat-icon green">
          <LifeBuoy size={19} />
        </span>
        <div>
          <h2>Still stuck?</h2>
          <p>
            Check your <Link className="inline-link" to="/progress">progress</Link>, back up
            or reset your data in <Link className="inline-link" to="/settings">Settings</Link>,
            or browse <Link className="inline-link" to="/topics">all topics</Link> to find
            where to go next.
          </p>
        </div>
      </section>
    </div>
  );
}

export default HelpPage;
