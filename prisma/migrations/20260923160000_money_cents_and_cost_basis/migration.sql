-- Store money as integer cents instead of floating-point dollars.
--
-- Hand-written (not the Prisma-generated default) so that existing
-- transaction amounts are converted, not dropped: each dollar amount is
-- rounded to the nearest cent.

-- AlterTable
ALTER TABLE "Holding" ADD COLUMN "costBasisCents" INTEGER;

-- AlterTable
ALTER TABLE "PriceCache" ADD COLUMN "currency" TEXT;

-- Cached quotes have no recorded currency; clear them so they are refetched
-- with one. This is derived data and is safe to drop.
DELETE FROM "PriceCache";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Transaction" ("id", "type", "amountCents", "category", "description", "date", "createdAt", "updatedAt")
SELECT "id", "type", CAST(ROUND("amount" * 100) AS INTEGER), "category", "description", "date", "createdAt", "updatedAt" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
