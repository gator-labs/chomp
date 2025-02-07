-- Step 1: Add the new column
ALTER TABLE "MysteryBoxPrize" ADD COLUMN "mysteryBoxTriggerId" TEXT;

-- Step 2: Populate the new column with the appropriate values
UPDATE "MysteryBoxPrize"
SET "mysteryBoxTriggerId" = subquery."id"
FROM (
    SELECT "MysteryBoxPrize"."id" AS "prizeId", "MysteryBoxTrigger"."id" AS "id"
    FROM "MysteryBoxTrigger"
    JOIN "MysteryBox" ON "MysteryBox".id = "MysteryBoxTrigger"."mysteryBoxId"
    JOIN "MysteryBoxPrize" ON "MysteryBox".id = "MysteryBoxPrize"."mysteryBoxId"
    WHERE "MysteryBoxTrigger"."triggerType" IN ('TutorialCompleted', 'ChompmasStreakAttained')
) AS subquery
WHERE "MysteryBoxPrize"."id" = subquery."prizeId";

-- Step 3: Add the foreign key constraint for the new column
ALTER TABLE "MysteryBoxPrize" ADD CONSTRAINT "MysteryBoxPrize_mysteryBoxTriggerId_fkey" FOREIGN KEY ("mysteryBoxTriggerId") REFERENCES "MysteryBoxTrigger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 4: Drop the old foreign key constraint and the old column
ALTER TABLE "MysteryBoxPrize" DROP CONSTRAINT "MysteryBoxPrize_mysteryBoxId_fkey";
ALTER TABLE "MysteryBoxPrize" DROP COLUMN "mysteryBoxId";