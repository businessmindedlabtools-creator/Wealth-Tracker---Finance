// Ensures the directory for the SQLite file exists before `prisma migrate deploy`.
// Prisma creates the .db file itself but not missing parent directories.
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

import { sqlitePathFromEnv } from "./db-path.mjs";

const file = sqlitePathFromEnv();

if (file) {
  mkdirSync(dirname(file), { recursive: true });
  console.log(`SQLite database path: ${file}`);
}
