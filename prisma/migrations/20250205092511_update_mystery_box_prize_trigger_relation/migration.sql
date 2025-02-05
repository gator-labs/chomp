/*
  Warnings:

  - You are about to drop the column `mysteryBoxId` on the `MysteryBoxPrize` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "MysteryBoxPrize" DROP CONSTRAINT "MysteryBoxPrize_mysteryBoxId_fkey";

-- AlterTable
ALTER TABLE "MysteryBoxPrize" DROP COLUMN "mysteryBoxId",
ADD COLUMN     "mysteryBoxTriggerId" TEXT;

-- AddForeignKey
ALTER TABLE "MysteryBoxPrize" ADD CONSTRAINT "MysteryBoxPrize_mysteryBoxTriggerId_fkey" FOREIGN KEY ("mysteryBoxTriggerId") REFERENCES "MysteryBoxTrigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;
