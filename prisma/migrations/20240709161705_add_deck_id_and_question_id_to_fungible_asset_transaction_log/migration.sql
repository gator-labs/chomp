-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "deckId" INTEGER,
ADD COLUMN     "questionId" INTEGER;

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
