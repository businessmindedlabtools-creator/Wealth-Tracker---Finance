import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/password";
import { SESSION_TTL_SECONDS, createSessionToken, verifySessionToken } from "@/lib/session";
import { clearLoginFailures, loginRetryAfter, recordLoginFailure } from "@/lib/login-rate-limit";

const SECRET = "x".repeat(32);

describe("password hashing", () => {
  it("verifies the right password and rejects others", async () => {
    const hash = await hashPassword("correct horse battery");
    expect(hash).not.toContain("$"); // would be expanded inside .env files
    expect(await verifyPassword("correct horse battery", hash)).toBe(true);
    expect(await verifyPassword("correct horse batterY", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  it("uses a random salt", async () => {
    expect(await hashPassword("same")).not.toBe(await hashPassword("same"));
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("x", "")).toBe(false);
    expect(await verifyPassword("x", "bcrypt:1:2:3:a:b")).toBe(false);
  });
});

describe("session tokens", () => {
  const now = Date.UTC(2026, 0, 1);

  it("accepts a fresh token", () => {
    expect(verifySessionToken(createSessionToken(SECRET, now), SECRET, now)).toBe(true);
  });

  it("rejects expired tokens", () => {
    const token = createSessionToken(SECRET, now);
    expect(verifySessionToken(token, SECRET, now + SESSION_TTL_SECONDS * 1000 + 1000)).toBe(false);
  });

  it("rejects tokens signed with another secret or tampered with", () => {
    const token = createSessionToken(SECRET, now);
    expect(verifySessionToken(token, "y".repeat(32), now)).toBe(false);
    const [data, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ v: 1, iat: 0, exp: 9e12 })).toString("base64url");
    expect(verifySessionToken(`${forged}.${sig}`, SECRET, now)).toBe(false);
    expect(verifySessionToken(`${data}.${sig}x`, SECRET, now)).toBe(false);
    expect(verifySessionToken(data, SECRET, now)).toBe(false);
  });

  it("fails closed without a long enough secret", () => {
    const token = createSessionToken("short", now);
    expect(verifySessionToken(token, "short", now)).toBe(false);
    expect(verifySessionToken(token, undefined, now)).toBe(false);
    expect(verifySessionToken(undefined, SECRET, now)).toBe(false);
  });
});

describe("login rate limit", () => {
  it("locks a client out after 5 failures in 15 minutes", () => {
    const t = Date.UTC(2026, 0, 1);
    for (let i = 0; i < 5; i++) {
      expect(loginRetryAfter("1.2.3.4", t)).toBe(0);
      recordLoginFailure("1.2.3.4", t);
    }
    expect(loginRetryAfter("1.2.3.4", t)).toBeGreaterThan(0);
    expect(loginRetryAfter("1.2.3.4", t + 15 * 60 * 1000)).toBe(0);
    clearLoginFailures("1.2.3.4");
  });

  it("caps failures across all clients", () => {
    const t = Date.UTC(2027, 0, 1);
    for (let i = 0; i < 20; i++) recordLoginFailure(`10.0.0.${i}`, t);
    expect(loginRetryAfter("10.9.9.9", t)).toBeGreaterThan(0);
  });
});
