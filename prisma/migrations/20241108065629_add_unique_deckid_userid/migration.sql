/*
  Warnings:

  - A unique constraint covering the columns `[type, userId, questionId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[type, deckId, userId]` on the table `FungibleAssetTransactionLog` will be added. If there are existing duplicate values, this will fail.

*/

-- Remove duplicates for `type`, `userId`, and `questionId`
WITH CTE_KeepOldest AS (
    SELECT 
        MIN(ctid) AS oldest_ctid
    FROM "FungibleAssetTransactionLog"
    WHERE "questionId" IS NOT NULL
    GROUP BY "type", "userId", "questionId"
)
DELETE FROM "FungibleAssetTransactionLog"
WHERE "questionId" IS NOT NULL
AND ctid NOT IN (
    SELECT oldest_ctid
    FROM CTE_KeepOldest
);

-- Remove duplicates for `type`, `deckId`, and `userId`
WITH CTE_KeepOldest AS (
    SELECT 
        MIN(ctid) AS oldest_ctid
    FROM "FungibleAssetTransactionLog"
    WHERE "deckId" IS NOT NULL
    GROUP BY "type", "deckId", "userId"
)
DELETE FROM "FungibleAssetTransactionLog"
WHERE "deckId" IS NOT NULL
AND ctid NOT IN (
    SELECT oldest_ctid
    FROM CTE_KeepOldest
);

-- Create unique index for `type`, `userId`, and `questionId`
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_userId_questionId_key" 
ON "FungibleAssetTransactionLog"("type", "userId", "questionId");

-- Create unique index for `type`, `deckId`, and `userId`
CREATE UNIQUE INDEX "FungibleAssetTransactionLog_type_deckId_userId_key" 
ON "FungibleAssetTransactionLog"("type", "deckId", "userId");
