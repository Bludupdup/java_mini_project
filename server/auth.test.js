// Runs the real auth routes on a throwaway HTTP server with a temporary
// accounts file, and talks to them with fetch, just like the browser does.
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createAuthHandler } from "./authApi.js";
import { createAuthStore } from "./authStore.js";

let server;
let baseUrl;
let folder;

beforeAll(async () => {
  folder = await mkdtemp(join(tmpdir(), "dsa-auth-test-"));
  const handle = createAuthHandler(createAuthStore(join(folder, "auth.json")));

  // Vite mounts the handler at /api/auth and strips that prefix; do the same.
  server = createServer((req, res) => {
    req.url = req.url.replace(/^\/api\/auth/, "");
    handle(req, res);
  });
  await new Promise((resolve) => server.listen(0, resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api/auth`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
  await rm(folder, { recursive: true, force: true });
});

function post(path, body, cookie) {
  return fetch(baseUrl + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: JSON.stringify(body),
  });
}

const me = (cookie) => fetch(`${baseUrl}/me`, { headers: cookie ? { Cookie: cookie } : {} });
const cookieFrom = (response) => response.headers.get("set-cookie")?.split(";")[0];

describe("auth API", () => {
  const sam = { name: "Sam", email: "Sam@Example.com", password: "correct horse" };
  let cookie;

  it("registers an account and logs it straight in", async () => {
    const response = await post("/register", sam);
    const setCookie = response.headers.get("set-cookie");

    expect(response.status).toBe(201);
    expect((await response.json()).user).toMatchObject({ name: "Sam", email: "sam@example.com" });
    expect(setCookie).toMatch(/^dsa_session=[\w-]+; Path=\/; HttpOnly; SameSite=Lax; Max-Age=\d+$/);

    cookie = cookieFrom(response);
    expect((await (await me(cookie)).json()).user.name).toBe("Sam");
  });

  it("never stores the password or the session token itself", async () => {
    const file = await readFile(join(folder, "auth.json"), "utf8");

    expect(file).not.toContain("correct horse");
    expect(file).not.toContain(cookie.split("=")[1]);
  });

  it("refuses a second account with the same email, in any case", async () => {
    const response = await post("/register", { ...sam, email: "SAM@example.com" });

    expect(response.status).toBe(409);
    expect((await response.json()).fields.email).toMatch(/already exists/);
  });

  it("explains invalid fields", async () => {
    const response = await post("/register", { name: "", email: "nope", password: "123" });
    const { fields } = await response.json();

    expect(response.status).toBe(400);
    expect(Object.keys(fields)).toEqual(["name", "email", "password"]);
  });

  it("logs in with the right password only, with the same message for unknown emails", async () => {
    const wrong = await post("/login", { email: sam.email, password: "wrong horse" });
    const unknown = await post("/login", { email: "who@example.com", password: "whatever1" });
    const right = await post("/login", { email: " sam@example.COM ", password: sam.password });

    expect(wrong.status).toBe(401);
    expect(unknown.status).toBe(401);
    expect((await wrong.json()).error).toBe((await unknown.json()).error);
    expect(right.status).toBe(200);
    expect(cookieFrom(right)).toMatch(/^dsa_session=/);
  });

  it("logs out by ending the session on the server", async () => {
    const response = await post("/logout", {}, cookie);

    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    // The old cookie is useless now, even if someone kept a copy.
    expect((await me(cookie)).status).toBe(401);
  });

  it("pauses logins after 5 wrong passwords", async () => {
    const attempt = () => post("/login", { email: "lock@example.com", password: "wrong pass" });

    for (let i = 0; i < 5; i += 1) expect((await attempt()).status).toBe(401);
    expect((await attempt()).status).toBe(429);
  });

  it("only accepts JSON, which blocks cross-site form posts", async () => {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "email=sam%40example.com&password=correct+horse",
    });

    expect(response.status).toBe(415);
  });

  it("says nobody is logged in without a cookie", async () => {
    expect((await me()).status).toBe(401);
  });
});
