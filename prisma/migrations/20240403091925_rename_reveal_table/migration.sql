/*
  Warnings:

  - You are about to drop the `QuestionReveal` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionReveal" DROP CONSTRAINT "QuestionReveal_deckId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionReveal" DROP CONSTRAINT "QuestionReveal_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionReveal" DROP CONSTRAINT "QuestionReveal_userId_fkey";

-- DropTable
DROP TABLE "QuestionReveal";

-- CreateTable
CREATE TABLE "Reveal" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER,
    "deckId" INTEGER,

    CONSTRAINT "Reveal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Reveal" ADD CONSTRAINT "Reveal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reveal" ADD CONSTRAINT "Reveal_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reveal" ADD CONSTRAINT "Reveal_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
