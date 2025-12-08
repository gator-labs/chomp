/*
  Warnings:

  - A unique constraint covering the columns `[sunsetRewardId]` on the table `CampaignMysteryBoxAllowlist` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CampaignMysteryBoxAllowlist" ADD COLUMN     "sunsetRewardId" INTEGER;

-- CreateTable
CREATE TABLE "SunsetReward" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "bonkReward" TEXT NOT NULL,

    CONSTRAINT "SunsetReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMysteryBoxAllowlist_sunsetRewardId_key" ON "CampaignMysteryBoxAllowlist"("sunsetRewardId");

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowlist" ADD CONSTRAINT "CampaignMysteryBoxAllowlist_sunsetRewardId_fkey" FOREIGN KEY ("sunsetRewardId") REFERENCES "SunsetReward"("id") ON DELETE SET NULL ON UPDATE CASCADE;
