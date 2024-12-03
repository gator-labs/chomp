/*
  Warnings:

  - A unique constraint covering the columns `[mysteryBoxId,tokenAddress]` on the table `MysteryBoxPrize` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxPrize_mysteryBoxId_tokenAddress_key" ON "MysteryBoxPrize"("mysteryBoxId", "tokenAddress");
