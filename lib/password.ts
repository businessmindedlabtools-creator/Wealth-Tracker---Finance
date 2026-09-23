// Password hashing with Node's built-in scrypt. Kept free of path-alias imports
// so `scripts/hash-password.mjs` can import it directly.
//
// Hash format: scrypt:<N>:<r>:<p>:<salt base64url>:<key base64url>
// (colon-separated because `$` would be expanded inside .env files).
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const KEY_LENGTH = 64;
const DEFAULT_PARAMS = { N: 2 ** 15, r: 8, p: 1 };
export const MIN_PASSWORD_LENGTH = 12;

function deriveKey(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, options, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

function maxmem({ N, r }: { N: number; r: number }) {
  return 256 * N * r;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt, { ...DEFAULT_PARAMS, maxmem: maxmem(DEFAULT_PARAMS) });
  const { N, r, p } = DEFAULT_PARAMS;
  return ["scrypt", N, r, p, salt.toString("base64url"), key.toString("base64url")].join(":");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split(":");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (![N, r, p].every(Number.isSafeInteger)) return false;
  const salt = Buffer.from(parts[4], "base64url");
  const expected = Buffer.from(parts[5], "base64url");
  if (expected.length !== KEY_LENGTH) return false;
  const key = await deriveKey(password, salt, { N, r, p, maxmem: maxmem({ N, r }) });
  return timingSafeEqual(key, expected);
}
