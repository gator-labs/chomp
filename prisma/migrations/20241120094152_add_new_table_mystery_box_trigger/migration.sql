/*
  Warnings:

  - You are about to drop the column `questionId` on the `MysteryBox` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MysteryBox" DROP CONSTRAINT "MysteryBox_questionId_fkey";

-- DropIndex
DROP INDEX "MysteryBox_questionId_key";

-- AlterTable
ALTER TABLE "MysteryBox" DROP COLUMN "questionId";

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "mysteryBoxId" TEXT;

-- CreateTable
CREATE TABLE "MysteryBoxTrigger" (
    "id" TEXT NOT NULL,
    "questionId" INTEGER,
    "mysteryBoxId" TEXT,

    CONSTRAINT "MysteryBoxTrigger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxTrigger_questionId_key" ON "MysteryBoxTrigger"("questionId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
