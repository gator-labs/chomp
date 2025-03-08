/*
  Warnings:

  - Added the required column `boxType` to the `CampaignMysteryBox` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignMysteryBox" ADD COLUMN     "boxType" TEXT NOT NULL;
