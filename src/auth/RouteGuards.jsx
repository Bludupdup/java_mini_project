import { Navigate, useLocation } from "react-router-dom";
import Splash from "../components/Splash";
import { useAuth } from "./AuthContext";

/** Full-screen "checking your session" or "server unreachable" screen. */
function AuthSplash() {
  const { status, error, retry } = useAuth();

  return <Splash error={status === "error" ? error : null} onRetry={retry} />;
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
