/*
  Warnings:

  - A unique constraint covering the columns `[userId,questionId,deckId]` on the table `ChompResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ChompResult_userId_questionId_deckId_key" ON "ChompResult"("userId", "questionId", "deckId");
