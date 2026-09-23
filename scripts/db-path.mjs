// Resolves the SQLite file path from DATABASE_URL (shared by the db scripts).
import { isAbsolute, resolve } from "node:path";

export function sqlitePathFromEnv() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  if (!url.startsWith("file:")) return null;
  const path = url.slice("file:".length).split("?")[0];
  // Relative paths are resolved against the prisma/ folder (schema location).
  return isAbsolute(path) ? path : resolve("prisma", path);
}
