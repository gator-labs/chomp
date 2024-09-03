/*
  Warnings:

  - You are about to drop the column `walletAddress` on the `UsedGenesisNft` table. All the data in the column will be lost.
  - Added the required column `userId` to the `UsedGenesisNft` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UsedGenesisNft" DROP CONSTRAINT "UsedGenesisNft_walletAddress_fkey";

-- AlterTable
ALTER TABLE "ChompResult" ADD COLUMN     "transactionSignature" TEXT;

-- AlterTable
ALTER TABLE "UsedGenesisNft" DROP COLUMN "walletAddress",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UsedGenesisNft" ADD CONSTRAINT "UsedGenesisNft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
