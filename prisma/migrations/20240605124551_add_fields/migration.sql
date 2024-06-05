/*
  Warnings:

  - You are about to drop the `UsedGenisisNft` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UsedGenisisNft" DROP CONSTRAINT "UsedGenisisNft_walletAddress_fkey";

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "calculatedAveragePercentage" INTEGER,
ADD COLUMN     "calculatedIsCorrect" BOOLEAN,
ADD COLUMN     "calculatedPercentageOfSelectedAnswers" INTEGER;

-- DropTable
DROP TABLE "UsedGenisisNft";
