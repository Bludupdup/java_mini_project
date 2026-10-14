/**
 * Talks to /api/auth on the Java backend. The session lives in an HttpOnly
 * cookie that the browser sends by itself, so this code never sees or stores it.
 */

import { apiRequest } from "../api/apiClient";

/** The logged-in user, or null when nobody is. */
export async function fetchCurrentUser() {
  try {
    return (await apiRequest("/auth/me")).user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export const logIn = async ({ email, password }) =>
  (await apiRequest("/auth/login", { method: "POST", body: { email, password } })).user;

export const register = async ({ name, email, password }) =>
  (await apiRequest("/auth/register", { method: "POST", body: { name, email, password } })).user;

export const logOut = () => apiRequest("/auth/logout", { method: "POST" });
