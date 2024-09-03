/*
  Warnings:

  - A unique constraint covering the columns `[nftId,userId]` on the table `RevealNft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "RevealNft_nftId_userId_key" ON "RevealNft"("nftId", "userId");
