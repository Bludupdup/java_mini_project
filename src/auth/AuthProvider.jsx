import { useEffect, useMemo, useState } from "react";
import { claimGuestProgress } from "../learning/learningStore";
import { AuthContext } from "./AuthContext";
import { fetchCurrentUser, logIn, logOut, register } from "./authClient";

const LOADING = { status: "loading", user: null, error: null };

// Asks the server whether the session cookie still belongs to someone.
async function readSession() {
  try {
    const user = await fetchCurrentUser();
    return { status: user ? "signed-in" : "signed-out", user, error: null };
  } catch (error) {
    return { status: "error", user: null, error: error.message };
  }
}

/** Knows who is logged in, by asking the server once when the app opens. */
function AuthProvider({ children }) {
  const [auth, setAuth] = useState(LOADING);

  useEffect(() => {
    let cancelled = false;

    readSession().then((next) => {
      if (!cancelled) setAuth(next);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const actions = useMemo(
    () => ({
      retry: async () => {
        setAuth(LOADING);
        setAuth(await readSession());
      },

      logIn: async (credentials) => {
        const user = await logIn(credentials);
        setAuth({ status: "signed-in", user, error: null });
      },

      register: async (details) => {
        const user = await register(details);
        // Progress made before accounts existed belongs to the first new account.
        claimGuestProgress(user.id);
        setAuth({ status: "signed-in", user, error: null });
      },

      logOut: async () => {
        try {
          await logOut();
        } finally {
          // Even if the server can't be reached, forget the user on this side.
          setAuth({ status: "signed-out", user: null, error: null });
        }
      },
    }),
    [],
  );

  const value = useMemo(() => ({ ...auth, ...actions }), [auth, actions]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

export default AuthProvider;
