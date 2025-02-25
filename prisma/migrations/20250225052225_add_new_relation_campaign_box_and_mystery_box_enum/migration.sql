/*
  Warnings:

  - A unique constraint covering the columns `[campaignMysteryBoxId,mysteryBoxAllowlistId]` on the table `MysteryBoxTrigger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
ALTER TYPE "EBoxTriggerType" ADD VALUE 'CampaignReward';

-- AlterTable
ALTER TABLE "MysteryBoxTrigger" ADD COLUMN     "campaignMysteryBoxId" TEXT;

-- CreateTable
CREATE TABLE "CampaignMysteryBoxAllowlist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignMysteryBoxId" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "CampaignMysteryBoxAllowlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMysteryBoxAllowlist_campaignMysteryBoxId_address_key" ON "CampaignMysteryBoxAllowlist"("campaignMysteryBoxId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxTrigger_campaignMysteryBoxId_mysteryBoxAllowlistI_key" ON "MysteryBoxTrigger"("campaignMysteryBoxId", "mysteryBoxAllowlistId");

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_campaignMysteryBoxId_fkey" FOREIGN KEY ("campaignMysteryBoxId") REFERENCES "CampaignMysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowlist" ADD CONSTRAINT "CampaignMysteryBoxAllowlist_campaignMysteryBoxId_fkey" FOREIGN KEY ("campaignMysteryBoxId") REFERENCES "CampaignMysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowlist" ADD CONSTRAINT "CampaignMysteryBoxAllowlist_address_fkey" FOREIGN KEY ("address") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
