import { Navigate, useLocation } from "react-router-dom";
import { Boxes, LoaderCircle, RefreshCw, TriangleAlert } from "lucide-react";
import { useAuth } from "./AuthContext";

/** Full-screen "checking your session" or "server unreachable" screen. */
function AuthSplash() {
  const { status, error, retry } = useAuth();

  return (
    <div className="auth-screen">
      <div className="auth-splash" role={status === "error" ? "alert" : "status"}>
        <div className="brand-icon">
          <Boxes size={23} />
        </div>

        {status === "error" ? (
          <>
            <p>
              <TriangleAlert size={16} /> {error}
            </p>
            <button type="button" className="secondary-button" onClick={retry}>
              <RefreshCw size={15} />
              Try again
            </button>
          </>
        ) : (
          <p>
            <LoaderCircle className="viz-spin" size={16} /> Loading your space…
          </p>
        )}
      </div>
    </div>
  );
}

/** Pages behind the login: anyone not logged in is sent to /login first. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading" || status === "error") return <AuthSplash />;
  if (status === "signed-out") {
    // Remember where they were going, to send them there after logging in.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

/** Login and register: someone already logged in goes on to the app. */
export function GuestOnly({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <AuthSplash />;
  if (status === "signed-in") {
    const from = location.state?.from;
    return <Navigate to={from ? `${from.pathname}${from.search}` : "/"} replace />;
  }

  return children;
}
