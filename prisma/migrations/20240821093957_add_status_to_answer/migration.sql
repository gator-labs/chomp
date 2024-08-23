/*
  Warnings:

  - You are about to drop the column `hasViewedButNotSubmitted` on the `QuestionAnswer` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerStatus" AS ENUM ('Viewed', 'Submitted');

-- AlterTable
ALTER TABLE "QuestionAnswer" DROP COLUMN "hasViewedButNotSubmitted",
ADD COLUMN     "status" "AnswerStatus" NOT NULL DEFAULT 'Submitted';
