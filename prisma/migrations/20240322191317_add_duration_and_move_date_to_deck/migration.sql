/*
  Warnings:

  - You are about to drop the column `date` on the `QuestionDeck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "durationMiliseconds" BIGINT;

-- AlterTable
ALTER TABLE "QuestionDeck" DROP COLUMN "date";
