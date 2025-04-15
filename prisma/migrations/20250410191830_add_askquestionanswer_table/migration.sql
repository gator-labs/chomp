/*
  Warnings:

  - A unique constraint covering the columns `[type,userId,askQuestionAnswerId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "FungibleAssetTransactionLog" ADD COLUMN     "askQuestionAnswerId" INTEGER;

-- CreateTable
CREATE TABLE "AskQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AskQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AskQuestionAnswer_questionId_userId_key" ON "AskQuestionAnswer"("questionId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_userId_askQuestionAnswerId_key" ON "FungibleAssetTransactionLog"("type", "userId", "askQuestionAnswerId");

-- AddForeignKey
ALTER TABLE "AskQuestionAnswer" ADD CONSTRAINT "AskQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AskQuestionAnswer" ADD CONSTRAINT "AskQuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FungibleAssetTransactionLog" ADD CONSTRAINT "FungibleAssetTransactionLog_askQuestionAnswerId_fkey" FOREIGN KEY ("askQuestionAnswerId") REFERENCES "AskQuestionAnswer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
