/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[deckId,userId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_userId_questionId_key" ON "FungibleAssetTransactionLog"("type", "userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_deckId_userId_key" ON "FungibleAssetTransactionLog"("deckId", "userId");
