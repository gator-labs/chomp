-- Updates the rewards views to:
--
-- 1. Cast the amounts as strings to match Prisma schema
-- 2. Filter out entries with NULL deckId or questionId

BEGIN TRANSACTION;

DROP VIEW "DeckRewards";

CREATE VIEW "DeckRewards" AS
SELECT
    mb."userId",
    dq."deckId",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "bonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "creditsReward"
    FROM "DeckQuestion" dq
    LEFT JOIN "MysteryBoxTrigger" mbt ON mbt."questionId" = dq."questionId"
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL AND dq."deckId" IS NOT NULL
    GROUP BY ("userId", dq."deckId");

DROP VIEW "QuestionRewards";

CREATE VIEW "QuestionRewards" AS
SELECT
    mb."userId",
    "questionId",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "bonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "creditsReward"
    FROM "MysteryBoxTrigger" mbt
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL AND "questionId" IS NOT NULL
    GROUP BY("userId", "questionId");

COMMIT;
