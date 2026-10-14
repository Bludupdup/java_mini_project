/**
 * The production server: the whole app at one address (used by the Docker
 * image; try it locally with `npm run build` then `npm start`).
 *
 *   /api/visualize  the AI analyzer, run here in Node where the AI key lives
 *   /api/...        forwarded to the Spring Boot backend (BACKEND_URL)
 *   anything else   the built React app in dist/ (index.html for app routes
 *                   such as /topics/arrays, so React Router can show them)
 *
 * One address means the login cookie belongs to this site, exactly like the
 * Vite proxy in development. No packages needed: only Node's own modules.
 */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, request as httpRequest } from "node:http";
import { extname, resolve, sep } from "node:path";
import { createBackendAuth } from "./backendAuth.js";
import { sendJson } from "./http.js";
import { createModelCaller } from "./llm.js";
import { createVisualizeHandler } from "./visualizeApi.js";

const PORT = Number(process.env.PORT) || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://127.0.0.1:8080";
const DIST = resolve(process.env.DIST_DIR || "dist");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
};

const visualize = createVisualizeHandler({
  llm: createModelCaller(process.env),
  getRequestUser: createBackendAuth(BACKEND_URL),
});

/** Passes the request to Spring Boot and streams its answer back. */
function proxyToBackend(req, res) {
  const target = new URL(req.url, BACKEND_URL);
  const headers = {
    ...req.headers,
    host: target.host,
    // Lets Spring know the visitor used HTTPS, so it marks the login cookie Secure.
    "x-forwarded-proto": req.headers["x-forwarded-proto"] ?? "http",
    "x-forwarded-host": req.headers.host,
  };

  const upstream = httpRequest(target, { method: req.method, headers }, (response) => {
    res.writeHead(response.statusCode, response.headers);
    response.pipe(res);
  });

  upstream.on("error", () => {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    sendJson(res, 502, { error: "The server is still starting up. Try again in a minute." });
  });

  req.pipe(upstream);
}

/** Serves a file from dist/, or index.html for any path that isn't a file. */
async function serveApp(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { error: "Use GET." });
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://app").pathname);
  } catch {
    sendJson(res, 400, { error: "Bad address." });
    return;
  }

  // resolve() removes "..", and the check keeps every file inside dist/.
  const requested = resolve(DIST, `.${pathname}`);
  const insideDist = requested === DIST || requested.startsWith(DIST + sep);
  let file = resolve(DIST, "index.html");

  if (insideDist) {
    const info = await stat(requested).catch(() => null);
    if (info?.isFile()) file = requested;
  }

  // Built files have a content hash in their name, so they can be cached for a year.
  const hashed = file.includes(`${sep}assets${sep}`);

  res.writeHead(200, {
    "Content-Type": CONTENT_TYPES[extname(file)] ?? "application/octet-stream",
    "Cache-Control": hashed ? "public, max-age=31536000, immutable" : "no-cache",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "same-origin",
  });

  if (req.method === "HEAD") {
    res.end();
    return;
  }
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const path = req.url.split("?")[0];

  if (path === "/api/visualize") return visualize(req, res);
  if (path === "/api" || path.startsWith("/api/")) return proxyToBackend(req, res);
  return serveApp(req, res).catch((error) => {
    console.error("[app]", error);
    if (!res.headersSent) sendJson(res, 500, { error: "Something went wrong." });
  });
});

// AI visualizations can take a few minutes, so don't cut long requests off.
server.requestTimeout = 0;
server.headersTimeout = 60_000;

server.listen(PORT, () => {
  console.log(`[app] DSA Universe on port ${PORT}; backend at ${BACKEND_URL}; app files from ${DIST}`);
});
