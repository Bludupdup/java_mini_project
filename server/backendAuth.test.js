import { describe, expect, it } from "vitest";
import { BackendUnavailableError, createBackendAuth } from "./backendAuth.js";

const SAM = { id: 1, name: "Sam", email: "sam@example.com" };

// A stand-in for fetch that records what it was asked and answers with `reply`.
function fakeFetch(reply) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, headers: options.headers });
    if (reply instanceof Error) throw reply;
    return {
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: async () => reply.body,
    };
  };
  return { calls, fetchImpl };
}

const request = (headers) => ({ headers });

describe("createBackendAuth", () => {
  it("asks the backend with the browser's cookie and returns the user", async () => {
    const { calls, fetchImpl } = fakeFetch({ status: 200, body: { user: SAM } });
    const getUser = createBackendAuth("http://backend:8080", fetchImpl);

    expect(await getUser(request({ cookie: "dsa_session=abc" }))).toEqual(SAM);
    expect(calls).toEqual([
      { url: "http://backend:8080/api/auth/me", headers: { cookie: "dsa_session=abc" } },
    ]);
  });

  it("doesn't ask at all when there is no cookie or token", async () => {
    const { calls, fetchImpl } = fakeFetch({ status: 200, body: { user: SAM } });

    expect(await createBackendAuth("http://backend", fetchImpl)(request({}))).toBeNull();
    expect(calls).toEqual([]);
  });

  it("returns null when the backend says the login isn't valid", async () => {
    const { fetchImpl } = fakeFetch({ status: 401, body: { error: "You're not logged in." } });

    expect(await createBackendAuth("http://backend", fetchImpl)(request({ cookie: "x=1" }))).toBeNull();
  });

  it("reports a backend that is down or broken", async () => {
    const down = createBackendAuth("http://backend", fakeFetch(new Error("ECONNREFUSED")).fetchImpl);
    const broken = createBackendAuth("http://backend", fakeFetch({ status: 500, body: null }).fetchImpl);

    await expect(down(request({ cookie: "x=1" }))).rejects.toBeInstanceOf(BackendUnavailableError);
    await expect(broken(request({ cookie: "x=1" }))).rejects.toBeInstanceOf(BackendUnavailableError);
  });
});
