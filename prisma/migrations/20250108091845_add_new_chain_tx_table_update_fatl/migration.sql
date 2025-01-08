-- CreateEnum
CREATE TYPE "EChainTxStatus" AS ENUM ('New', 'Pending', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "EChainTxType" AS ENUM ('CreditPurchase');

-- AlterEnum
ALTER TYPE "TransactionLogType" ADD VALUE 'CreditPurchase';

-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN "chainTxHash" TEXT;

-- CreateTable
CREATE TABLE "ChainTx" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "status" "EChainTxStatus" NOT NULL,
    "solAmount" TEXT NOT NULL,
    "feeSolAmount" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "recipientAddress" TEXT NOT NULL,
    "type" "EChainTxType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChainTx_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChainTx_hash_key" ON "ChainTx"("hash");
