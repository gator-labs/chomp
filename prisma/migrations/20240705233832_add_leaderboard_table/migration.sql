-- AlterTable
ALTER TABLE "Deck" ADD COLUMN     "campaignId" INTEGER;

-- CreateTable
CREATE TABLE "DailyLeaderboard" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "campaignId" INTEGER,
    "firstOrderAccuracy" INTEGER DEFAULT 0,
    "secondOrderAccuracy" INTEGER DEFAULT 0,
    "points" INTEGER DEFAULT 0,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyLeaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyLeaderboard_date_idx" ON "DailyLeaderboard"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyLeaderboard_userId_campaignId_date_key" ON "DailyLeaderboard"("userId", "campaignId", "date");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLeaderboard" ADD CONSTRAINT "DailyLeaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyLeaderboard" ADD CONSTRAINT "DailyLeaderboard_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
