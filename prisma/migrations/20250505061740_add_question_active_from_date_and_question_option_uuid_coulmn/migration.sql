-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "activeFromDate" TIMESTAMP(3);

ALTER TABLE "QuestionOption" ADD COLUMN "uuid" UUID;

UPDATE "QuestionOption" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;

-- AlterTable
ALTER TABLE "QuestionOption" ALTER COLUMN "uuid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_uuid_key" ON "QuestionOption"("uuid");
