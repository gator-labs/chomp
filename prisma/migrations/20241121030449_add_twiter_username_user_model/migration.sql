/*
  Warnings:

  - A unique constraint covering the columns `[twitterUsername]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "twitterUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_twitterUsername_key" ON "User"("twitterUsername");
