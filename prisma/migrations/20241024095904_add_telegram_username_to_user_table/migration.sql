/*
  Warnings:

  - You are about to drop the column `telegramId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `telegramUserName` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "telegramId",
DROP COLUMN "telegramUserName",
ADD COLUMN     "telegramUsername" TEXT;
