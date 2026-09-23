// Restores the SQLite database from a backup file.
//
//   node scripts/restore-db.mjs backups/finance-YYYYMMDD-HHMMSS.db
//
// Stop the app first. The current database is kept next to it as
// `<name>.before-restore-<timestamp>` so a restore can itself be undone.
import { copyFileSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

import { sqlitePathFromEnv } from "./db-path.mjs";

const backupArg = process.argv[2];
if (!backupArg) {
  console.error("Usage: node scripts/restore-db.mjs <backup-file>");
  process.exit(1);
}
const backup = resolve(backupArg);
if (!existsSync(backup)) {
  console.error(`Backup not found: ${backup}`);
  process.exit(1);
}

const check = new PrismaClient({ datasourceUrl: `file:${backup}` });
const [{ integrity_check: status }] = await check.$queryRawUnsafe("PRAGMA integrity_check");
await check.$disconnect();
if (status !== "ok") {
  console.error(`Refusing to restore: integrity_check returned ${status}`);
  process.exit(1);
}

const dbFile = sqlitePathFromEnv();
if (existsSync(dbFile)) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "").replace("T", "-");
  const saved = `${dbFile}.before-restore-${stamp}`;
  copyFileSync(dbFile, saved);
  console.log(`Current database saved to ${saved}`);
}
// Drop stale WAL/journal files so they are not replayed onto the restored copy.
for (const suffix of ["-wal", "-shm", "-journal"]) rmSync(`${dbFile}${suffix}`, { force: true });
copyFileSync(backup, dbFile);
console.log(`Restored ${backup} -> ${dbFile}`);
console.log("Run `npx prisma migrate deploy` if the backup predates the latest migration.");
