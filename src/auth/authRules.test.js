import { describe, expect, it } from "vitest";
import { normalizeEmail, validateLogin, validateRegistration } from "./authRules";

const good = { name: "Sam", email: "sam@example.com", password: "correct horse" };

describe("account rules", () => {
  it("accepts a valid registration", () => {
    expect(validateRegistration(good)).toEqual({});
  });

  it("explains every problem with a registration", () => {
    expect(validateRegistration({ name: " ", email: "sam@", password: "short" })).toEqual({
      name: "Enter your name.",
      email: "Enter a valid email address, like sam@example.com.",
      password: "Use at least 8 characters.",
    });
    expect(validateRegistration({ ...good, password: "SAM@example.com" }).password).toBe(
      "Don't use your email address as your password.",
    );
    expect(validateRegistration({ ...good, name: "x".repeat(41) }).name).toBe(
      "Use at most 40 characters.",
    );
  });

  it("copes with missing or non-text values from the network", () => {
    expect(Object.keys(validateRegistration({}))).toEqual(["name", "email", "password"]);
    expect(Object.keys(validateLogin({ email: 42, password: null }))).toEqual(["email", "password"]);
  });

  it("treats emails case-insensitively", () => {
    expect(normalizeEmail("  Sam@Example.COM ")).toBe("sam@example.com");
    expect(validateLogin({ email: " SAM@example.com ", password: "x" })).toEqual({});
  });
});
