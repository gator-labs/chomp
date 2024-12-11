-- DropForeignKey
ALTER TABLE "MysteryBoxTrigger" DROP CONSTRAINT "MysteryBoxTrigger_mysteryBoxAllowlistId_fkey";

-- AlterTable
ALTER TABLE "MysteryBoxTrigger" ALTER COLUMN "mysteryBoxAllowlistId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "MysteryBoxTrigger" ADD CONSTRAINT "MysteryBoxTrigger_mysteryBoxAllowlistId_fkey" FOREIGN KEY ("mysteryBoxAllowlistId") REFERENCES "MysteryBoxAllowlist"("address") ON DELETE SET NULL ON UPDATE CASCADE;
