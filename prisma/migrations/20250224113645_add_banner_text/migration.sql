/*
  Warnings:

  - Added the required column `text` to the `Banner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Banner" ADD COLUMN     "text" TEXT NOT NULL;
