/*
  Warnings:

  - You are about to drop the column `durationMiliseconds` on the `Question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "durationMiliseconds",
ADD COLUMN     "durationMilliseconds" BIGINT;
