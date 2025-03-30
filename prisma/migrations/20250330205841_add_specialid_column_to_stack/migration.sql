/*
  Warnings:

  - A unique constraint covering the columns `[specialId]` on the table `Stack` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ESpecialStack" AS ENUM ('CommunityAsk');

-- AlterTable
ALTER TABLE "Stack" ADD COLUMN     "specialId" "ESpecialStack";

-- CreateIndex
CREATE UNIQUE INDEX "Stack_specialId_key" ON "Stack"("specialId");
