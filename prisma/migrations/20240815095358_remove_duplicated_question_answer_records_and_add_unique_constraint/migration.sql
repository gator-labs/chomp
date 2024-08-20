DELETE FROM public."QuestionAnswer"
WHERE "hasViewedButNotSubmitted" = true;
WITH DuplicateRecords AS (
  SELECT id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId",
      "questionOptionId"
      ORDER BY "createdAt" DESC,
        id DESC
    ) AS row_num
  FROM public."QuestionAnswer"
)
DELETE FROM public."QuestionAnswer"
WHERE id IN (
    SELECT id
    FROM DuplicateRecords
    WHERE row_num > 1
  );
/*
 Warnings:
 
 - A unique constraint covering the columns `[questionOptionId,userId]` on the table `QuestionAnswer` will be added. If there are existing duplicate values, this will fail.
 
 */
-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_questionOptionId_userId_key" ON "QuestionAnswer"("questionOptionId", "userId");