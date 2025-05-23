-- CreateIndex
CREATE INDEX "QuestionAnswer_questionOptionId_idx" ON "QuestionAnswer"("questionOptionId");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");
