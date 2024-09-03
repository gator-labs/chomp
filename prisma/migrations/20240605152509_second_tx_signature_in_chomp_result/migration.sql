/*
  Warnings:

  - You are about to drop the column `transactionSignature` on the `ChompResult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ChompResult" DROP COLUMN "transactionSignature",
ADD COLUMN     "burnTransactionSignature" TEXT,
ADD COLUMN     "rewardTokenAmount" DECIMAL(65,30),
ADD COLUMN     "sendTransactionSignature" TEXT;
