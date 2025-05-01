DROP VIEW IF EXISTS "UserQuestionAnswerStatus";

CREATE VIEW "UserQuestionAnswerStatus" AS
SELECT
    q."id" as "questionId",
    qa."userId",
    CASE
      -- Question not seen - no QuestionAnswers found
      -- Technically this indicator type will not be produced
      -- by this view as there are no records to aggregate.
      -- This case is left here for clarity nonetheless.
      WHEN COUNT(CASE WHEN qa."selected" IS NOT NULL THEN 1 ELSE NULL END) = 0 THEN 'unseen'
      -- No question answer selected (none has selected = true)
      WHEN COUNT(CASE WHEN qa."selected" IS TRUE THEN 1 ELSE NULL END) = 0 THEN 'unanswered'
      -- No second order answer, so considered incomplete
      WHEN COUNT(CASE WHEN qa."percentage" IS NOT NULL THEN 1 ELSE NULL END) = 0 THEN 'incomplete'
      -- Revealed and calculated question with correct response
      WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" = true AND qa."selected" = true THEN 1 ELSE NULL END) > 0 THEN 'correct'
      -- Revealed and calculated question with incorrect response
      WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" != qa."selected" THEN 1 ELSE NULL END) > 0 THEN 'incorrect'
      -- Otherwise, result unknown
      ELSE 'unrevealed'
    END AS "indicatorType"
FROM
    "Question" q
    JOIN "QuestionOption" qo ON q."id" = qo."questionId"
    JOIN "QuestionAnswer" qa ON qa."questionOptionId" = qo.id
GROUP BY q."id", qa."userId";
