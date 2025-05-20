-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Question_isArchived_idx" ON "Question"("isArchived");
