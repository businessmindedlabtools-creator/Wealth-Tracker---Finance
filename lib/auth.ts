import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  createSessionToken,
  getSessionSecret,
  verifySessionToken,
} from "@/lib/session";

export async function isAuthenticated(): Promise<boolean> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, getSessionSecret());
}

/**
 * Call at the top of every page and server action that touches data. Server
 * actions are reachable by direct POST, so the proxy check alone is not enough.
 * Reading cookies also opts the caller into request-time (dynamic) rendering.
 */
export async function requireSession(): Promise<void> {
  if (!(await isAuthenticated())) {
    redirect("/login");
  }
}

export async function startSession(): Promise<void> {
  const secret = getSessionSecret();
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  (await cookies()).set(SESSION_COOKIE, createSessionToken(secret), {
    httpOnly: true,
    // Set AUTH_INSECURE_COOKIE=1 only when serving production over plain HTTP
    // on a trusted network (browsers drop Secure cookies on non-localhost HTTP).
    secure: process.env.NODE_ENV === "production" && process.env.AUTH_INSECURE_COOKIE !== "1",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
