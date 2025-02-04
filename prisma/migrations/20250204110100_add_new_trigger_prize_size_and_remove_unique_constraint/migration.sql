-- AlterEnum
ALTER TYPE "EBoxTriggerType" ADD VALUE 'ValidationReward';

-- AlterEnum
ALTER TYPE "EPrizeSize" ADD VALUE 'Hub';

-- DropIndex
DROP INDEX "MysteryBoxPrize_mysteryBoxId_tokenAddress_key";
