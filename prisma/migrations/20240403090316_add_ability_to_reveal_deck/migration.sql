-- DropForeignKey
ALTER TABLE "QuestionReveal" DROP CONSTRAINT "QuestionReveal_questionId_fkey";

-- AlterTable
ALTER TABLE "QuestionReveal" ADD COLUMN     "deckId" INTEGER,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "QuestionReveal" ADD CONSTRAINT "QuestionReveal_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReveal" ADD CONSTRAINT "QuestionReveal_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;
