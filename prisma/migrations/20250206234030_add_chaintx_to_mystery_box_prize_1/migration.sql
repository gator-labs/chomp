-- AlterEnum
ALTER TYPE "EChainTxType" ADD VALUE 'MysteryBoxClaim';

-- AlterTable
ALTER TABLE "ChainTx" ADD COLUMN     "tokenAddress" TEXT,
ADD COLUMN     "tokenAmount" TEXT;
