/*
  Warnings:

  - You are about to drop the `QuestionDeck` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionDeck" DROP CONSTRAINT "QuestionDeck_deckId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionDeck" DROP CONSTRAINT "QuestionDeck_questionId_fkey";

-- DropTable
DROP TABLE "QuestionDeck";

-- CreateTable
CREATE TABLE "DeckQuestion" (
    "id" SERIAL NOT NULL,
    "deckId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "DeckQuestion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DeckQuestion" ADD CONSTRAINT "DeckQuestion_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckQuestion" ADD CONSTRAINT "DeckQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
