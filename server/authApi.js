/**
 * /api/auth/* — register, log in, log out, and "who am I?".
 *
 * A Vite plugin, like visualizeApi. Logging in sets a session cookie that is:
 *   HttpOnly   page scripts can't read it, so injected code can't steal it
 *   SameSite   other sites can't send it along with their own requests
 * The browser then sends it automatically with every request to our server.
 */

import { normalizeEmail, validateLogin, validateRegistration } from "../src/auth/authRules.js";
import { SESSION_SECONDS } from "./authStore.js";
import { BadRequestError, isRecord, readCookie, readJsonBody, sendJson } from "./http.js";

export const SESSION_COOKIE = "dsa_session";

// After this many wrong passwords for one email, wait before trying again.
const MAX_FAILED_LOGINS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

function sessionCookie(token, req) {
  // Secure (HTTPS only) when served over HTTPS; plain localhost is HTTP.
  const secure = req.socket.encrypted ? "; Secure" : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_SECONDS}${secure}`;
}

const expiredCookie = `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;

/** The logged-in user making this request, or null. Other routes use this too. */
export function getRequestUser(store, req) {
  return store.findSessionUser(readCookie(req, SESSION_COOKIE));
}

function invalid(res, fields) {
  sendJson(res, 400, { error: "Please fix the highlighted fields.", fields });
}

/** A plain (req, res) handler, so tests can run it without Vite. */
export function createAuthHandler(store) {
  const failedLogins = new Map(); // email → { count, since }

  function isLockedOut(email) {
    const record = failedLogins.get(email);

    if (record && Date.now() - record.since > LOCKOUT_MS) failedLogins.delete(email);
    return (failedLogins.get(email)?.count ?? 0) >= MAX_FAILED_LOGINS;
  }

  function recordFailure(email) {
    const record = failedLogins.get(email) ?? { count: 0, since: Date.now() };
    failedLogins.set(email, { ...record, count: record.count + 1 });
  }

  async function startSession(res, req, status, user) {
    const token = await store.createSession(user.id);
    sendJson(res, status, { user }, { "Set-Cookie": sessionCookie(token, req) });
  }

  const routes = {
    async "POST /register"(req, res) {
      const body = await readJsonBody(req);
      const details = isRecord(body) ? body : {};
      const fields = validateRegistration(details);

      if (Object.keys(fields).length > 0) return invalid(res, fields);

      const result = await store.createUser({
        name: details.name.trim(),
        email: normalizeEmail(details.email),
        password: details.password,
      });

      if (result.error) {
        const message = "An account with this email already exists. Try logging in.";
        return sendJson(res, 409, { error: message, fields: { email: message } });
      }

      return startSession(res, req, 201, result.user);
    },

    async "POST /login"(req, res) {
      const body = await readJsonBody(req);
      const details = isRecord(body) ? body : {};
      const fields = validateLogin(details);

      if (Object.keys(fields).length > 0) return invalid(res, fields);

      const email = normalizeEmail(details.email);

      if (isLockedOut(email)) {
        return sendJson(res, 429, {
          error: "Too many wrong passwords. Wait 15 minutes, then try again.",
        });
      }

      const user = await store.checkPassword(email, details.password);

      if (!user) {
        recordFailure(email);
        // Same message either way, so nobody can find out which emails have accounts.
        return sendJson(res, 401, { error: "That email and password don't match." });
      }

      failedLogins.delete(email);
      return startSession(res, req, 200, user);
    },

    async "POST /logout"(req, res) {
      await store.deleteSession(readCookie(req, SESSION_COOKIE));
      sendJson(res, 200, { ok: true }, { "Set-Cookie": expiredCookie });
    },

    async "GET /me"(req, res) {
      const user = await getRequestUser(store, req);

      if (!user) return sendJson(res, 401, { error: "You're not logged in." });
      return sendJson(res, 200, { user });
    },
  };

  return async function handle(req, res) {
    // Mounted at /api/auth, so req.url is "/login", "/me", ...
    const route = routes[`${req.method} ${req.url.split("?")[0]}`];

    if (!route) return sendJson(res, 404, { error: "Not found." });

    try {
      await route(req, res);
    } catch (error) {
      if (error instanceof BadRequestError) {
        return sendJson(res, error.status, { error: error.message });
      }

      console.error("[auth]", error);
      return sendJson(res, 500, { error: "Something went wrong. Please try again." });
    }
  };
}

export function authApi(store) {
  const handle = createAuthHandler(store);
  const addRoute = (server) => {
    server.middlewares.use("/api/auth", handle);
  };

  return { name: "auth-api", configureServer: addRoute, configurePreviewServer: addRoute };
}
