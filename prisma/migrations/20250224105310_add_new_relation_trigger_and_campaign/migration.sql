/*
  Warnings:

  - A unique constraint covering the columns `[campaignMysteryBoxId,mysteryBoxAllowlistId]` on the table `MysteryBoxTrigger` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MysteryBoxTrigger" ADD COLUMN     "campaignMysteryBoxId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxTrigger_campaignMysteryBoxId_mysteryBoxAllowlistI_key" ON "MysteryBoxTrigger"("campaignMysteryBoxId", "mysteryBoxAllowlistId");

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_campaignMysteryBoxId_fkey" FOREIGN KEY ("campaignMysteryBoxId") REFERENCES "CampaignMysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE;
