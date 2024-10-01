/*
  Warnings:

  - A unique constraint covering the columns `[revealNftId]` on the table `ChompResult` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChompResult" ADD COLUMN     "revealNftId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChompResult_revealNftId_key" ON "ChompResult"("revealNftId");

-- AddForeignKey
ALTER TABLE "ChompResult" ADD CONSTRAINT "ChompResult_revealNftId_fkey" FOREIGN KEY ("revealNftId") REFERENCES "RevealNft"("nftId") ON DELETE SET NULL ON UPDATE CASCADE;
