/*
  Warnings:

  - You are about to drop the `Streak` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Streak" DROP CONSTRAINT "Streak_userId_fkey";

-- DropTable
DROP TABLE "Streak";
