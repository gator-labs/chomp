-- CreateTable
CREATE TABLE "Deck" (
    "id" SERIAL NOT NULL,
    "deck" TEXT NOT NULL,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionDeck" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3),
    "deckId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionDeck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionDeck" ADD CONSTRAINT "QuestionDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDeck" ADD CONSTRAINT "QuestionDeck_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
