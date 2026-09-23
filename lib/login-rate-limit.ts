// In-memory brute-force protection for the single login form. State resets on
// restart, which is acceptable for a single-instance, single-user app.

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES_PER_CLIENT = 5;
// Caps attempts across all clients, since client keys (IPs) can be spoofed or rotated.
const MAX_FAILURES_GLOBAL = 20;
const GLOBAL_KEY = "*";

const failures = new Map<string, number[]>();

function recent(key: string, now: number) {
  const list = (failures.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  failures.set(key, list);
  return list;
}

/** Milliseconds until the client may try again, or 0 if allowed now. */
export function loginRetryAfter(clientKey: string, now = Date.now()): number {
  const checks: [string, number][] = [
    [clientKey, MAX_FAILURES_PER_CLIENT],
    [GLOBAL_KEY, MAX_FAILURES_GLOBAL],
  ];
  let wait = 0;
  for (const [key, max] of checks) {
    const list = recent(key, now);
    if (list.length >= max) wait = Math.max(wait, list[0] + WINDOW_MS - now);
  }
  return wait;
}

export function recordLoginFailure(clientKey: string, now = Date.now()) {
  for (const key of [clientKey, GLOBAL_KEY]) recent(key, now).push(now);
}

export function clearLoginFailures(clientKey: string) {
  failures.delete(clientKey);
}
