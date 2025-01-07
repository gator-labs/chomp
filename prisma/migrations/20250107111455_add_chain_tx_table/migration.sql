-- CreateEnum
CREATE TYPE "EChainTxType" AS ENUM ('CreditPurchase');

-- CreateEnum
CREATE TYPE "EChainTxStatus" AS ENUM ('New', 'Confirmed', 'Finalized');

-- CreateTable
CREATE TABLE "ChainTx" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "ChainTx_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainTx_hash_key" ON "ChainTx"("hash");

-- CreateIndex
CREATE INDEX "ChainTx_hash_idx" ON "ChainTx"("hash");
