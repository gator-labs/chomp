-- AlterEnum
ALTER TYPE "EBoxTriggerType" ADD VALUE 'CampaignReward';

-- CreateTable
CREATE TABLE "CampaignMysteryBoxAllowed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignMysteryBoxId" TEXT NOT NULL,
    "allowlistAddress" TEXT NOT NULL,

    CONSTRAINT "CampaignMysteryBoxAllowed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMysteryBoxAllowed_campaignMysteryBoxId_allowlistAdd_key" ON "CampaignMysteryBoxAllowed"("campaignMysteryBoxId", "allowlistAddress");

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_campaignMysteryBoxId_fkey" FOREIGN KEY ("campaignMysteryBoxId") REFERENCES "CampaignMysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_allowlistAddress_fkey" FOREIGN KEY ("allowlistAddress") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
