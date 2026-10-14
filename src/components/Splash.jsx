import { Boxes, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";

/**
 * Full-screen "Loading…" or "something went wrong" screen, shown while the
 * app waits for the server before it can draw anything useful.
 * Pass `error` (and `onRetry`) to show the error version.
 */
function Splash({ message = "Loading your space…", error = null, onRetry }) {
  return (
    <div className="auth-screen">
      <div className="auth-splash" role={error ? "alert" : "status"}>
        <div className="brand-icon">
          <Boxes size={23} />
        </div>

        {error ? (
          <>
            <p>
              <TriangleAlert size={16} /> {error}
            </p>
            {onRetry && (
              <button type="button" className="secondary-button" onClick={onRetry}>
                <RefreshCw size={15} />
                Try again
              </button>
            )}
          </>
        ) : (
          <p>
            <LoaderCircle className="viz-spin" size={16} /> {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default Splash;
