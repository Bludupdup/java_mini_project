/**
 * Who is logged in? The Java backend knows: logins live there (a JWT in the
 * dsa_session cookie). Node routes such as /api/visualize ask it by passing
 * the browser's cookie along to GET /api/auth/me.
 */

/** Thrown when the backend can't be asked at all (not running, crashed). */
export class BackendUnavailableError extends Error {}

/**
 * Returns getRequestUser(req) → the logged-in user ({ id, name, email }) or null.
 * fetchImpl is only swapped out in tests.
 */
export function createBackendAuth(backendUrl, fetchImpl = fetch) {
  return async function getRequestUser(req) {
    const { cookie, authorization } = req.headers;

    if (!cookie && !authorization) return null;

    let response;

    try {
      response = await fetchImpl(`${backendUrl}/api/auth/me`, {
        headers: {
          ...(cookie && { cookie }),
          ...(authorization && { authorization }),
        },
      });
    } catch (error) {
      throw new BackendUnavailableError(`Can't reach the backend at ${backendUrl}: ${error.message}`);
    }

    if (response.status === 401) return null;
    if (!response.ok) {
      throw new BackendUnavailableError(`The backend answered /api/auth/me with ${response.status}.`);
    }

    return (await response.json()).user ?? null;
  };
}
