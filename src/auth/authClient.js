/**
 * Talks to /api/auth on our server. The session lives in an HttpOnly cookie
 * that the browser sends by itself, so this code never sees or stores it.
 */

/** A failed request. `fields` holds per-field messages, e.g. { email: "..." }. */
export class AuthError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, body) {
  let response;

  try {
    response = await fetch(`/api/auth${path}`, {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthError("Can't reach the server. Is it running?", 0);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AuthError(
      data?.error ?? `The server answered with status ${response.status}.`,
      response.status,
      data?.fields,
    );
  }

  return data;
}

/** The logged-in user, or null when nobody is. */
export async function fetchCurrentUser() {
  try {
    return (await request("/me")).user;
  } catch (error) {
    if (error.status === 401) return null;
    throw error;
  }
}

export const logIn = async ({ email, password }) =>
  (await request("/login", { email, password })).user;

export const register = async ({ name, email, password }) =>
  (await request("/register", { name, email, password })).user;

export const logOut = () => request("/logout", {});
