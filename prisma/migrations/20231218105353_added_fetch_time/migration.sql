/*
  Warnings:

  - Added the required column `fetchTime` to the `Meta` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Meta" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fetchTime" DATETIME NOT NULL,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    CONSTRAINT "Meta_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Meta" ("entryId", "id", "name", "price") SELECT "entryId", "id", "name", "price" FROM "Meta";
DROP TABLE "Meta";
ALTER TABLE "new_Meta" RENAME TO "Meta";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
