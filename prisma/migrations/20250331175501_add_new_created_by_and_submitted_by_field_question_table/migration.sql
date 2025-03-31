-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "createdByUserId" TEXT,
ADD COLUMN     "isSubmittedByUser" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
