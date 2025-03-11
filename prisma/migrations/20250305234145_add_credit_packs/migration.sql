-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "creditPackId" TEXT;

-- CreateTable
CREATE TABLE "CreditPack" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "costPerCredit" TEXT NOT NULL,
    "originalCostPerCredit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditPack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_creditPackId_fkey" FOREIGN KEY ("creditPackId") REFERENCES "CreditPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
