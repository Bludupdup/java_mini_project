/**
 * Every call to the Java backend goes through here. In development, Vite
 * forwards /api/* to http://localhost:8080 (see vite.config.js), so the page
 * and the API share one address and the login cookie just works.
 *
 * The login cookie is HttpOnly: the browser sends it by itself, and this
 * code never sees or stores it.
 */

/** A failed request. `fields` holds per-field messages, e.g. { email: "..." }. */
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const BACKEND_DOWN =
  "Can't reach the backend server. Is it running? (See README: start it with run.bat.)";

// Streaks count the learner's own calendar days, so the server needs our zone.
function timeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return undefined;
  }
}

/**
 * apiRequest("/learning") → GET /api/learning, parsed JSON.
 * apiRequest("/learning/...", { method: "PUT", body }) sends body as JSON.
 * Resolves to null for "204 No Content"; throws ApiError for anything else that isn't 2xx.
 */
export async function apiRequest(path, { method = "GET", body } = {}) {
  const headers = {};
  const zone = timeZone();

  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (zone) headers["X-Time-Zone"] = zone;

  let response;

  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
    });
  } catch {
    throw new ApiError(BACKEND_DOWN, 0);
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Our backend always answers errors with JSON. No JSON and a 5xx means the
    // dev server's proxy couldn't reach it at all.
    if (!data && response.status >= 500) throw new ApiError(BACKEND_DOWN, response.status);

    throw new ApiError(
      data?.error ?? `The server answered with status ${response.status}.`,
      response.status,
      data?.fields,
    );
  }

  return data;
}
