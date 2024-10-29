-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isSubscriber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramId" BIGINT;
