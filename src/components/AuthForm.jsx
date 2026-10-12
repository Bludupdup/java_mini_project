import { useId, useState } from "react";
import { Boxes, Eye, EyeOff, TriangleAlert } from "lucide-react";

/** The centred card that the login and register pages sit in. */
export function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-screen">
      <main className="auth-card">
        <div className="brand auth-brand">
          <div className="brand-icon">
            <Boxes size={23} />
          </div>
          <div>
            <h2>DSA<span> Universe</span></h2>
            <p>YOUR LEARNING SPACE</p>
          </div>
        </div>

        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>

        {children}

        <p className="auth-footer">{footer}</p>
      </main>
    </div>
  );
}

/** A labelled input with its error (or hint) below. Passwords get a show/hide button. */
export function AuthField({ label, error, hint, type = "text", ...inputProps }) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";
  const messageId = `${id}-message`;

  return (
    <div className={`auth-field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>

      <div className="auth-input">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          aria-invalid={Boolean(error)}
          aria-describedby={error || hint ? messageId : undefined}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-reveal"
            onClick={() => setRevealed(!revealed)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
          >
            {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>

      {(error || hint) && (
        <p className={error ? "auth-error-text" : "auth-hint"} id={messageId}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
}

/** The message at the top of a form when the server says no. */
export function FormAlert({ children }) {
  if (!children) return null;

  return (
    <p className="auth-alert" role="alert">
      <TriangleAlert size={16} />
      {children}
    </p>
  );
}
