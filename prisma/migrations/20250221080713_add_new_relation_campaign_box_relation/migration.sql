-- CreateTable
CREATE TABLE "CampaignMysteryBoxAllowed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campaignId" TEXT NOT NULL,
    "allowlistAddress" TEXT NOT NULL,

    CONSTRAINT "CampaignMysteryBoxAllowed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMysteryBoxAllowed_campaignId_allowlistAddress_key" ON "CampaignMysteryBoxAllowed"("campaignId", "allowlistAddress");

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "CampaignMysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_allowlistAddress_fkey" FOREIGN KEY ("allowlistAddress") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
