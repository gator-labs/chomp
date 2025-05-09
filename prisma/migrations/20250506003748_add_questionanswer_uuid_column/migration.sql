ALTER TABLE "QuestionAnswer" ADD COLUMN "uuid" UUID;

-- Updates QuestionAnswers to have a single UUID
-- that is shared among the answers for a given
-- question.

WITH "quuids" AS (
  SELECT "questionId", qo.id AS "questionOptionId", "quuid"
  FROM "QuestionOption" qo
  LEFT JOIN (
    SELECT id, gen_random_uuid() as quuid
    FROM "Question"
  ) q
  ON qo."questionId" = q.id
)
UPDATE
  "QuestionAnswer" qa
  SET uuid = quuids.quuid
  FROM quuids
  WHERE quuids."questionOptionId" = qa."questionOptionId"
  AND qa.uuid IS NULL;

ALTER TABLE "QuestionAnswer" ALTER COLUMN "uuid" SET NOT NULL;
