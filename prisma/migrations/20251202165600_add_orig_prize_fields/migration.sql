-- Updates the rewards views to add a field for the original
-- (unscaled) prizes.

BEGIN TRANSACTION;

DROP VIEW IF EXISTS "DeckRewards";

CREATE VIEW "DeckRewards" AS
SELECT
    mb."userId",
    dq."deckId",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "bonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "creditsReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST(COALESCE("origAmount", "amount") AS NUMERIC) ELSE NULL END) AS TEXT) AS "origBonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST(COALESCE("origAmount", "amount") AS NUMERIC) ELSE NULL END) AS TEXT) AS "origCreditsReward"
    FROM "DeckQuestion" dq
    LEFT JOIN "MysteryBoxTrigger" mbt ON mbt."questionId" = dq."questionId"
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL AND dq."deckId" IS NOT NULL AND mb."status" = 'Opened'
    GROUP BY ("userId", dq."deckId");

DROP VIEW IF EXISTS "QuestionRewards";

CREATE VIEW "QuestionRewards" AS
SELECT
    mb."userId",
    "questionId",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "bonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS TEXT) AS "creditsReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST(COALESCE("origAmount", "amount") AS NUMERIC) ELSE NULL END) AS TEXT) AS "origBonkReward",
    CAST(SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST(COALESCE("origAmount", "amount") AS NUMERIC) ELSE NULL END) AS TEXT) AS "origCreditsReward"
    FROM "MysteryBoxTrigger" mbt
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL AND "questionId" IS NOT NULL AND mb."status" = 'Opened'
    GROUP BY("userId", "questionId");

COMMIT;
