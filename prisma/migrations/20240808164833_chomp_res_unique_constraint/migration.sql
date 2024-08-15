-- DELETE DUPLICATIONS
   WITH DuplicateRecords AS (
    SELECT 
        cr."id",
        cr."userId", 
        cr."questionId", 
        cr."deckId",
        cr."createdAt",
        ROW_NUMBER() OVER (
            PARTITION BY cr."userId", cr."questionId", cr."deckId"
            ORDER BY cr."createdAt" DESC
        ) AS rn
    FROM 
        "ChompResult" cr
    WHERE 
        cr."questionId" IS NOT NULL OR cr."deckId" IS NOT NULL
)
DELETE FROM 
    "ChompResult"
WHERE 
    "id" IN (
        SELECT "id"
        FROM DuplicateRecords
        WHERE rn > 1
    );

-- DropIndex
DROP INDEX "ChompResult_userId_questionId_deckId_key";

-- CreateIndex
CREATE UNIQUE INDEX "ChompResult_userId_questionId_key" ON "ChompResult"("userId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ChompResult_userId_deckId_key" ON "ChompResult"("userId", "deckId");
