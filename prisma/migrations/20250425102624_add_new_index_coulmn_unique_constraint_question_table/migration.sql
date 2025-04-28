-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN     "index" INTEGER;


WITH ordered_options AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY "questionId" ORDER BY id ASC) - 1 AS new_index
  FROM "QuestionOption"
)
UPDATE "QuestionOption" qo
SET "index" = o.new_index
FROM ordered_options o
WHERE qo.id = o.id;


-- AlterTable
ALTER TABLE "QuestionOption"
ALTER COLUMN "index" SET NOT NULL;


-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_index_key" ON "QuestionOption"("questionId", "index");
