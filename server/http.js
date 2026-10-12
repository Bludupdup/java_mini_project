/** Small helpers shared by the server's API routes. */

const MAX_BODY_BYTES = 50_000;

/** Thrown for anything wrong with the request itself; answered with 400. */
export class BadRequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export const isRecord = (value) =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Reads a JSON request body. Only application/json is accepted: a plain
 * HTML form on another site can't send that, which blocks cross-site form
 * tricks against our cookie-protected routes.
 */
export function readJsonBody(req) {
  if (!req.headers["content-type"]?.startsWith("application/json")) {
    return Promise.reject(new BadRequestError("Send the request as JSON.", 415));
  }

  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      if (body.length > MAX_BODY_BYTES) {
        reject(new BadRequestError("The request is too large.", 413));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new BadRequestError("The request body must be JSON."));
      }
    });
    req.on("error", reject);
  });
}

export function sendJson(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
  res.end(JSON.stringify(data));
}

/** The value of one cookie from the request, or null. */
export function readCookie(req, name) {
  for (const part of (req.headers.cookie ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }

  return null;
}
