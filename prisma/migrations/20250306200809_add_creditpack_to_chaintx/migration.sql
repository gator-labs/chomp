-- AlterTable
ALTER TABLE "ChainTx" ADD COLUMN     "creditPackId" TEXT;

-- AddForeignKey
ALTER TABLE "ChainTx" ADD CONSTRAINT "ChainTx_creditPackId_fkey" FOREIGN KEY ("creditPackId") REFERENCES "CreditPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
