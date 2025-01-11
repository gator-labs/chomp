-- CreateEnum
CREATE TYPE "EChainTxType" AS ENUM ('CreditPurchase');

-- CreateEnum
CREATE TYPE "EChainTxStatus" AS ENUM ('New', 'Confirmed', 'Finalized');

-- AlterEnum
ALTER TYPE "TransactionLogType" ADD VALUE 'CreditPurchase';

-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "chainTxHash" TEXT;

-- CreateTable
CREATE TABLE "ChainTx" (
    "hash" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "type" "EChainTxType" NOT NULL,
    "solAmount" TEXT NOT NULL,
    "feeSolAmount" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "status" "EChainTxStatus" NOT NULL DEFAULT 'New',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizedAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),

    CONSTRAINT "ChainTx_pkey" PRIMARY KEY ("hash")
);

-- CreateIndex
CREATE INDEX "ChainTx_hash_idx" ON "ChainTx"("hash");

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_chainTxHash_fkey" FOREIGN KEY ("chainTxHash") REFERENCES "ChainTx"("hash") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ChainTx" 
ADD CONSTRAINT "hash_not_empty" 
CHECK ("hash" IS NOT NULL AND LENGTH("hash") > 85 AND LENGTH("hash") < 89);