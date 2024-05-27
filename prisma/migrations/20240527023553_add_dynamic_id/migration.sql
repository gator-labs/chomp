-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dynamicUserId" TEXT,
ALTER COLUMN "id" SET DEFAULT gen_random_uuid();

-- Copy existing id values to dynamicUserId
UPDATE "User" SET "dynamicUserId" = id;