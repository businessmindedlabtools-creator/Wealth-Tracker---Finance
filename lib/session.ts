// Stateless session tokens: an HMAC-SHA256-signed expiry timestamp.
// Used by both `proxy.ts` and server code, so it must not import request APIs.
//
// Rotating AUTH_SECRET invalidates every existing session.
import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
export const MIN_SECRET_LENGTH = 32;

type SessionPayload = { v: 1; iat: number; exp: number };

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(secret: string, now = Date.now()): string {
  const iat = Math.floor(now / 1000);
  const payload: SessionPayload = { v: 1, iat, exp: iat + SESSION_TTL_SECONDS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

export function verifySessionToken(
  token: string | undefined,
  secret: string | undefined,
  now = Date.now(),
): boolean {
  if (!token || !secret || secret.length < MIN_SECRET_LENGTH) return false;
  const [data, signature, ...rest] = token.split(".");
  if (!data || !signature || rest.length > 0) return false;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    return payload.v === 1 && typeof payload.exp === "number" && payload.exp > now / 1000;
  } catch {
    return false;
  }
}

/** The session secret, or undefined when it is missing or too short (fail closed). */
export function getSessionSecret(): string | undefined {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : undefined;
}
