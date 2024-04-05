-- CreateTable
CREATE TABLE "QuestionReveal" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuestionReveal_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionReveal" ADD CONSTRAINT "QuestionReveal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionReveal" ADD CONSTRAINT "QuestionReveal_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
