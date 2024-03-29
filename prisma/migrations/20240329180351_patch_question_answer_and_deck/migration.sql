/*
  Warnings:

  - You are about to drop the column `questionId` on the `QuestionAnswer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionAnswer" DROP CONSTRAINT "QuestionAnswer_questionId_fkey";

-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "revealAtAnswerCount" INTEGER,
ADD COLUMN     "revealAtDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "QuestionAnswer" DROP COLUMN "questionId",
ALTER COLUMN "percentage" DROP NOT NULL;
