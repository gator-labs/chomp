-- CreateTable
CREATE TABLE "CampaignMysteryBoxAllowed" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "campignId" TEXT NOT NULL,
    "allowlistAddress" TEXT NOT NULL,

    CONSTRAINT "CampaignMysteryBoxAllowed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignMysteryBoxAllowed_campignId_allowlistAddress_key" ON "CampaignMysteryBoxAllowed"("campignId", "allowlistAddress");

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_campignId_fkey" FOREIGN KEY ("campignId") REFERENCES "CampaignMysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignMysteryBoxAllowed" ADD CONSTRAINT "CampaignMysteryBoxAllowed_allowlistAddress_fkey" FOREIGN KEY ("allowlistAddress") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE RESTRICT ON UPDATE CASCADE;
