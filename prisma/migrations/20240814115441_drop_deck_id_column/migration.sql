DELETE FROM "ChompResult" cr WHERE cr."deckId" is not null;
/*
  Warnings:

  - You are about to drop the column `deckId` on the `ChompResult` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChompResult" DROP CONSTRAINT "ChompResult_deckId_fkey";

-- DropIndex
DROP INDEX "ChompResult_userId_deckId_key";

-- AlterTable
ALTER TABLE "ChompResult" DROP COLUMN "deckId",
ALTER COLUMN "transactionStatus" DROP DEFAULT;
