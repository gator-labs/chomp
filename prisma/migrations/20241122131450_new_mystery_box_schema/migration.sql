-- CreateEnum
CREATE TYPE "EMysteryBoxStatus" AS ENUM ('New', 'Opened', 'Unopened');

-- CreateEnum
CREATE TYPE "EBoxTriggerType" AS ENUM ('ClaimAll', 'DailyDeckCompleted');

-- CreateEnum
CREATE TYPE "EBoxPrizeStatus" AS ENUM ('Dismissed', 'Unclaimed', 'Claimed');

-- CreateEnum
CREATE TYPE "EPrizeSize" AS ENUM ('Small', 'Medium', 'Large');

-- CreateEnum
CREATE TYPE "EBoxPrizeType" AS ENUM ('Token', 'Credits', 'Points');

-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" TEXT NOT NULL,
    "status" "EMysteryBoxStatus" NOT NULL DEFAULT 'New',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MysteryBox_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MysteryBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MysteryBoxTrigger" (
    "id" TEXT NOT NULL,
    "triggerType" "EBoxTriggerType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" INTEGER,
    "deckId" INTEGER,
    "mysteryBoxId" TEXT,

    CONSTRAINT "MysteryBoxTrigger_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MysteryBoxTrigger_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MysteryBoxTrigger_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MysteryBoxTrigger_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    UNIQUE ("questionId", "triggerType"),
    UNIQUE ("deckId", "triggerType")
);

-- CreateTable
CREATE TABLE "MysteryBoxPrize" (
    "id" TEXT NOT NULL,
    "status" "EBoxPrizeStatus" NOT NULL DEFAULT 'Unclaimed',
    "size" "EPrizeSize" NOT NULL,
    "prizeType" "EBoxPrizeType" NOT NULL,
    "tokenAddress" TEXT,
    "amount" TEXT NOT NULL,
    "claimHash" TEXT,
    "rewardAmount" DECIMAL(65,30),
    "claimFungibleTxId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3),
    "mysteryBoxId" TEXT NOT NULL,

    CONSTRAINT "MysteryBoxPrize_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MysteryBoxPrize_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
