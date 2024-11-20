/*
  Warnings:

  - The values [Small,Medium,Large] on the enum `BoxSize` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BoxSize_new" AS ENUM ('small', 'medium', 'large');
ALTER TABLE "MysteryBoxPrize" ALTER COLUMN "size" TYPE "BoxSize_new" USING ("size"::text::"BoxSize_new");
ALTER TYPE "BoxSize" RENAME TO "BoxSize_old";
ALTER TYPE "BoxSize_new" RENAME TO "BoxSize";
DROP TYPE "BoxSize_old";
COMMIT;

-- AlterTable
ALTER TABLE "MysteryBoxPrize" ADD COLUMN     "tokenAddress" TEXT;
