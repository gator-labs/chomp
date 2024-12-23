/*
  Warnings:

  - A unique constraint covering the columns `[type,userId,mysteryBoxId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "FungibleAsset" ADD VALUE 'Credit';

-- AlterEnum
ALTER TYPE "TransactionLogType" ADD VALUE 'MysteryBox';

-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "mysteryBoxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_userId_mysteryBoxId_key" ON "FungibleAssetTransactionLog"("type", "userId", "mysteryBoxId");

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
