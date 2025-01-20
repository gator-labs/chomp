/*
  Warnings:

  - A unique constraint covering the columns `[type,chainTxHash,userId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChainTx" ALTER COLUMN "feeSolAmount" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_chainTxHash_userId_key" ON "FungibleAssetTransactionLog"("type", "chainTxHash", "userId");

ALTER TABLE "ChainTx" 
ADD CONSTRAINT "hash_not_empty" 
CHECK ("hash" IS NOT NULL AND LENGTH("hash") > 85 AND LENGTH("hash") < 89);
