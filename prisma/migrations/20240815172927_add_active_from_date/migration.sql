/*
  Warnings:

  - You are about to drop the column `isActive` on the `Deck` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deck" DROP COLUMN "isActive",
ADD COLUMN     "activeFromDate" TIMESTAMP(3);
