/*
  Warnings:

  - A unique constraint covering the columns `[uuid]` on the table `QuestionOption` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "activeFromDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "uuid" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_uuid_key" ON "QuestionOption"("uuid");
