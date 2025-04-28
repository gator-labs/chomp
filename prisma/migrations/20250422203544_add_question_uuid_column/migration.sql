-- AlterTable
ALTER TABLE "Question" ADD COLUMN "uuid" UUID;

UPDATE "Question" SET "uuid" = gen_random_uuid() WHERE "uuid" IS NULL;

ALTER TABLE "Question" ALTER COLUMN "uuid" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Question_uuid_key" ON "Question"("uuid");
