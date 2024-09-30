ALTER TABLE "Campaign" RENAME TO "Stack";

ALTER TABLE "Stack" RENAME CONSTRAINT "Campaign_pkey" TO "Stack_pkey";

ALTER TABLE "Deck" DROP CONSTRAINT "Deck_campaignId_fkey";

ALTER TABLE "Deck" RENAME COLUMN "campaignId" TO "stackId";

ALTER TABLE "Deck" ADD CONSTRAINT "Deck_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Question" DROP CONSTRAINT "Question_campaignId_fkey";

ALTER TABLE "Question" RENAME COLUMN "campaignId" TO "stackId";

ALTER TABLE "Question" ADD CONSTRAINT "Question_stackId_fkey" FOREIGN KEY ("stackId") REFERENCES "Stack"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "DailyLeaderboard" DROP CONSTRAINT "DailyLeaderboard_campaignId_fkey";

ALTER TABLE "DailyLeaderboard" DROP CONSTRAINT "DailyLeaderboard_userId_fkey";

DROP TABLE "DailyLeaderboard";
