/*
  Warnings:

  - You are about to drop the column `startAt` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "startAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "startAt";
