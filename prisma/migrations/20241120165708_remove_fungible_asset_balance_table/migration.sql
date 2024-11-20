/*
  Warnings:

  - You are about to drop the `FungibleAssetBalance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FungibleAssetBalance" DROP CONSTRAINT "FungibleAssetBalance_userId_fkey";

-- DropTable
DROP TABLE "FungibleAssetBalance";
