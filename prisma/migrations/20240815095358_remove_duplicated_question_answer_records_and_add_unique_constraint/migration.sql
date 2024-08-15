/*
  Warnings:

  - A unique constraint covering the columns `[questionOptionId,userId]` on the table `QuestionAnswer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_questionOptionId_userId_key" ON "QuestionAnswer"("questionOptionId", "userId");
