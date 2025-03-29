CREATE VIEW "DeckRewards" AS
SELECT
    mb."userId",
    dq."deckId",
    SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS "bonkReward",
    SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS "creditsReward"
    FROM "DeckQuestion" dq
    LEFT JOIN "MysteryBoxTrigger" mbt ON mbt."questionId" = dq."questionId"
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL
    GROUP BY ("userId", dq."deckId");

CREATE VIEW "QuestionRewards" AS
SELECT
    mb."userId",
    "questionId",
    SUM(CASE WHEN "prizeType" = 'Token' AND "tokenAddress" = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS "bonkReward",
    SUM(CASE WHEN "prizeType" = 'Credits' THEN CAST("amount" AS NUMERIC) ELSE NULL END) AS "creditsReward"
    FROM "MysteryBoxTrigger" mbt
    LEFT JOIN "MysteryBox" mb ON mbt."mysteryBoxId" = mb.id
    LEFT JOIN "MysteryBoxPrize" mbp ON mbp."mysteryBoxTriggerId" = mbt.id
    WHERE "userId" IS NOT NULL
    GROUP BY("userId", "questionId");
