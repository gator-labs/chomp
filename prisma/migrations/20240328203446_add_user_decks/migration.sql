-- CreateTable
CREATE TABLE "UserDeck" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "deckId" INTEGER NOT NULL,

    CONSTRAINT "UserDeck_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDeck" ADD CONSTRAINT "UserDeck_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeck" ADD CONSTRAINT "UserDeck_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
