// Ensures the directory for the SQLite file exists before `prisma migrate deploy`.
// Prisma creates the .db file itself but not missing parent directories.
import { mkdirSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

const url = process.env.DATABASE_URL;

if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

if (url.startsWith("file:")) {
  const path = url.slice("file:".length).split("?")[0];
  // Relative paths are resolved against the prisma/ folder (schema location).
  const file = isAbsolute(path) ? path : resolve("prisma", path);
  mkdirSync(dirname(file), { recursive: true });
  console.log(`SQLite database path: ${file}`);
}
