-- CreateEnum
CREATE TYPE "MysteryBoxStatus" AS ENUM ('New', 'Opened', 'UnOpened');

-- CreateEnum
CREATE TYPE "BoxTriggerType" AS ENUM ('ClaimAll', 'DailyDeckCompleted');

-- CreateEnum
CREATE TYPE "BoxPrizeStatus" AS ENUM ('UnClaimed', 'Claimed');

-- CreateEnum
CREATE TYPE "BoxSize" AS ENUM ('Small', 'Medium', 'Large');

-- CreateEnum
CREATE TYPE "BoxPrizeType" AS ENUM ('Token', 'Credits', 'Points');

-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" TEXT NOT NULL,
    "triggerType" "BoxTriggerType" NOT NULL,
    "status" "MysteryBoxStatus" NOT NULL DEFAULT 'New',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "questionId" INTEGER,
    "deckId" INTEGER,

    CONSTRAINT "MysteryBox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MysteryBoxPrize" (
    "id" TEXT NOT NULL,
    "status" "BoxPrizeStatus" NOT NULL DEFAULT 'UnClaimed',
    "size" "BoxSize" NOT NULL,
    "prizeType" "BoxPrizeType" NOT NULL,
    "amount" TEXT NOT NULL,
    "claimHash" TEXT,
    "rewardAmount" DECIMAL(65,30),
    "claimFungibleTxId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claimedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mysteryBoxId" TEXT NOT NULL,

    CONSTRAINT "MysteryBoxPrize_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBox_questionId_key" ON "MysteryBox"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBox_deckId_key" ON "MysteryBox"("deckId");

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBoxPrize_mysteryBoxId_key" ON "MysteryBoxPrize"("mysteryBoxId");

-- AddForeignKey
ALTER TABLE "MysteryBox" ADD CONSTRAINT "MysteryBox_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBox" ADD CONSTRAINT "MysteryBox_deckId_fkey" FOREIGN KEY ("deckId") REFERENCES "Deck"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBox" ADD CONSTRAINT "MysteryBox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MysteryBoxPrize" ADD CONSTRAINT "MysteryBoxPrize_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
