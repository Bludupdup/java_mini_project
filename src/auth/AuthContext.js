import { createContext, useContext } from "react";

export const AuthContext = createContext(null);

/**
 * { status, user, error, retry, logIn, register, logOut, sessionExpired }
 * status: "loading" | "signed-in" | "signed-out" | "error"
 */
export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) throw new Error("useAuth must be used inside <AuthProvider>.");

  return value;
}
