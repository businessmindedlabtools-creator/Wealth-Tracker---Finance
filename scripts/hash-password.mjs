// Generates the AUTH_PASSWORD_HASH (and a fresh AUTH_SECRET) for .env.
//
//   node scripts/hash-password.mjs
//
// Prompts for the password without echoing it, so it never lands in shell
// history. Piped input is also accepted: `echo ... | node scripts/hash-password.mjs`.
import { randomBytes } from "node:crypto";

import { MIN_PASSWORD_LENGTH, hashPassword } from "../lib/password.ts";

function readHidden(prompt) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) {
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (chunk) => (data += chunk));
      stdin.on("end", () => resolve(data.replace(/\r?\n$/, "")));
      return;
    }
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.setEncoding("utf8");
    let value = "";
    // Handle each character separately: a paste arrives as one multi-char chunk.
    const onData = (chunk) => {
      for (const char of chunk) {
        if (char === "\r" || char === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          resolve(value);
          return;
        } else if (char === "\u0003") {
          process.exit(130);
        } else if (char === "\u007f" || char === "\b") {
          value = value.slice(0, -1);
        } else {
          value += char;
        }
      }
    };
    stdin.on("data", onData);
    // An explicitly paused stream (from a previous prompt) is not resumed by
    // adding a "data" listener, so resume it or the process exits mid-prompt.
    stdin.resume();
  });
}

const password = await readHidden("Password: ");
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  process.exit(1);
}
// Only confirm when typed interactively.
if (process.stdin.isTTY) {
  const confirm = await readHidden("Confirm:  ");
  if (confirm !== password) {
    console.error("Passwords do not match.");
    process.exit(1);
  }
}

console.log("\nAdd these lines to .env (keep them secret, never commit them):\n");
console.log(`AUTH_PASSWORD_HASH="${await hashPassword(password)}"`);
console.log(`AUTH_SECRET="${randomBytes(32).toString("base64url")}"`);
