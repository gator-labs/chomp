-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "isSubmittedByUser" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
