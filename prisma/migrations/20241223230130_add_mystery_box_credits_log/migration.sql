/*
  Warnings:

  - A unique constraint covering the columns `[mysteryBoxPrizeId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FungibleAsset" ADD VALUE 'Credit';

-- AlterEnum
ALTER TYPE "TransactionLogType" ADD VALUE 'MysteryBox';

-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "mysteryBoxPrizeId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_mysteryBoxPrizeId_key" ON "FungibleAssetTransactionLog"("mysteryBoxPrizeId");

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_mysteryBoxPrizeId_fkey" FOREIGN KEY ("mysteryBoxPrizeId") REFERENCES "MysteryBoxPrize"("id") ON DELETE SET NULL ON UPDATE CASCADE;
