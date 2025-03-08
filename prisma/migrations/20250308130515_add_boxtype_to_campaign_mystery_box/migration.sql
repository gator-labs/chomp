-- AlterTable
ALTER TABLE "CampaignMysteryBox" ADD COLUMN     "boxType" TEXT;

UPDATE "CampaignMysteryBox" SET "boxType" = 'Bis1' WHERE "boxType" IS NULL;

-- AlterTable
ALTER TABLE "CampaignMysteryBox" ALTER COLUMN "boxType" SET NOT NULL;
