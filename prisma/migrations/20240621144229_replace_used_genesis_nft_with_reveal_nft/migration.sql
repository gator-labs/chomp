/*
  Warnings:

  - You are about to drop the `UsedGenesisNft` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NftType" AS ENUM ('Genesis', 'Glowburger');

-- CreateTable
CREATE TABLE "RevealNft" (
    "nftId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nftType" "NftType" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RevealNft_nftId_key" ON "RevealNft"("nftId");

-- AddForeignKey
ALTER TABLE "RevealNft" ADD CONSTRAINT "RevealNft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

insert into "RevealNft" ("nftId", "userId", "createdAt", "updatedAt", "nftType")
select
  "nftId",
  "userId",
  "createdAt",
  "updatedAt",
  'Genesis' AS "nftType"
from
  "UsedGenesisNft";

-- DropForeignKey
ALTER TABLE "UsedGenesisNft" DROP CONSTRAINT "UsedGenesisNft_userId_fkey";

-- DropTable
DROP TABLE "UsedGenesisNft";