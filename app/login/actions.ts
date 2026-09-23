"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { endSession, startSession } from "@/lib/auth";
import { clearLoginFailures, loginRetryAfter, recordLoginFailure } from "@/lib/login-rate-limit";
import { verifyPassword } from "@/lib/password";
import { getSessionSecret } from "@/lib/session";

export type LoginState = { error?: string } | undefined;

async function clientKey() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const passwordHash = process.env.AUTH_PASSWORD_HASH;
  if (!passwordHash || !getSessionSecret()) {
    return { error: "Login is not configured. Set AUTH_PASSWORD_HASH and AUTH_SECRET." };
  }

  const key = await clientKey();
  const retryAfter = loginRetryAfter(key);
  if (retryAfter > 0) {
    return { error: `Too many attempts. Try again in ${Math.ceil(retryAfter / 60000)} min.` };
  }

  const password = formData.get("password");
  const valid =
    typeof password === "string" &&
    password.length > 0 &&
    password.length <= 1024 &&
    (await verifyPassword(password, passwordHash));

  if (!valid) {
    recordLoginFailure(key);
    return { error: "Incorrect password." };
  }

  clearLoginFailures(key);
  await startSession();
  redirect("/");
}

export async function logout() {
  await endSession();
  redirect("/login");
}
