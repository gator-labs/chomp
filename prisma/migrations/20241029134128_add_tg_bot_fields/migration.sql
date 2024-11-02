-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBotSubscriber" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramId" BIGINT;
