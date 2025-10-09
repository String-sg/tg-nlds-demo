/*
  Warnings:

  - You are about to drop the `CaseSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Case" ADD COLUMN "interventions" TEXT;
ALTER TABLE "Case" ADD COLUMN "progressNotes" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CaseSession";
PRAGMA foreign_keys=on;
