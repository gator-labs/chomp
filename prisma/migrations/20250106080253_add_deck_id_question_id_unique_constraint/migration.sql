/*
  Warnings:

  - A unique constraint covering the columns `[deckId,questionId]` on the table `DeckQuestion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeckQuestion_deckId_questionId_key" ON "DeckQuestion"("deckId", "questionId");
