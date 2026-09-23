// Creates a consistent, verified snapshot of the SQLite database.
//
//   node scripts/backup-db.mjs            back up (fails if the DB is missing)
//   node scripts/backup-db.mjs --if-exists  skip quietly when there is no DB yet
//
// Uses `VACUUM INTO`, which is safe while the app is running, then opens the
// copy and runs `PRAGMA integrity_check` before keeping it. Old backups beyond
// BACKUP_KEEP (default 30) are deleted, oldest first.
//
// Env: DATABASE_URL (required), BACKUP_DIR (default ./backups), BACKUP_KEEP.
import { existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

import { sqlitePathFromEnv } from "./db-path.mjs";

const PREFIX = "finance-";
const ifExists = process.argv.includes("--if-exists");
const backupDir = resolve(process.env.BACKUP_DIR || "backups");
const keep = Number.parseInt(process.env.BACKUP_KEEP || "30", 10);

const dbFile = sqlitePathFromEnv();
if (!dbFile) {
  console.error("Backups are only supported for SQLite (file:) databases.");
  process.exit(1);
}
if (!existsSync(dbFile)) {
  if (ifExists) {
    console.log(`No database at ${dbFile} yet; skipping backup.`);
    process.exit(0);
  }
  console.error(`Database not found: ${dbFile}`);
  process.exit(1);
}

mkdirSync(backupDir, { recursive: true });
// UTC, with milliseconds so back-to-back backups (e.g. manual + build) don't collide.
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace("T", "-").replace(".", "-").replace("Z", "");
const target = join(backupDir, `${PREFIX}${stamp}.db`);
if (existsSync(target)) {
  console.error(`Backup already exists: ${target}`);
  process.exit(1);
}

const source = new PrismaClient({ datasourceUrl: `file:${dbFile}` });
try {
  await source.$executeRawUnsafe(`VACUUM INTO '${target.replaceAll("'", "''")}'`);
} finally {
  await source.$disconnect();
}

const copy = new PrismaClient({ datasourceUrl: `file:${target}` });
try {
  const [{ integrity_check: status }] = await copy.$queryRawUnsafe("PRAGMA integrity_check");
  if (status !== "ok") throw new Error(`integrity_check returned: ${status}`);
  const tables = await copy.$queryRawUnsafe(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );
  const counts = [];
  for (const { name } of tables) {
    const [{ n }] = await copy.$queryRawUnsafe(`SELECT count(*) AS n FROM "${name}"`);
    counts.push(`${name}=${n}`);
  }
  console.log(`Backup OK: ${target} (${counts.join(", ")})`);
} catch (error) {
  await copy.$disconnect();
  rmSync(target, { force: true });
  console.error(`Backup verification failed, removed ${target}:`, error);
  process.exit(1);
}
await copy.$disconnect();

if (Number.isFinite(keep) && keep > 0) {
  const backups = readdirSync(backupDir)
    .filter((name) => name.startsWith(PREFIX) && name.endsWith(".db"))
    .sort();
  for (const name of backups.slice(0, Math.max(0, backups.length - keep))) {
    rmSync(join(backupDir, name));
    console.log(`Pruned old backup: ${name}`);
  }
}

// Surface the size so an unexpectedly tiny backup is noticed.
console.log(`Size: ${statSync(target).size} bytes`);
