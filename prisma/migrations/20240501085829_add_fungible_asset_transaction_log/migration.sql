-- CreateEnum
CREATE TYPE "TransactionLogType" AS ENUM ('RevealAnswer', 'CorrectFirstOrder', 'CorrectSecondOrder', 'AnswerDeck', 'AnswerQuestion');

-- CreateTable
CREATE TABLE "FungibleAssetTransactionLog" (
    "id" SERIAL NOT NULL,
    "type" "TransactionLogType" NOT NULL,
    "asset" "FungibleAsset" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "change" DECIMAL(65,30) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "FungibleAssetTransactionLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
