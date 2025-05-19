-- Replaces the existing view with one that considers the objective
-- and subjective cases separately.
--
-- Also makes the query a bit more efficient.

DROP VIEW IF EXISTS public."UserQuestionAnswerStatus";

CREATE VIEW public."UserQuestionAnswerStatus" AS
WITH public."QuestionInfo" AS (
    SELECT
        qo."questionId",
        COUNT(*) FILTER (WHERE qo."isCorrect" IS TRUE) > 0 AS "isObjective"
    FROM
        public."QuestionOption" qo
    GROUP BY qo."questionId"
),
"AnswerInfo" AS (
    SELECT
        qo."questionId",
        qa."userId",
        COUNT(*) FILTER (WHERE qa."selected" IS NOT NULL) > 0 AS "hasSeenQuestion", 
        COUNT(*) FILTER (WHERE qa."selected" IS TRUE) > 0 AS "hasAnsweredFirstOrder",
        COUNT(*) FILTER (WHERE qa."percentage" IS NOT NULL) > 0 AS "hasAnsweredSecondOrder",
        COUNT(*) FILTER (WHERE qa."selected" AND qo."isCorrect" IS TRUE AND qa."questionOptionId" = qo.id) > 0 AS "isObjectiveCorrect",
        COUNT(*) FILTER (WHERE qa."selected" AND qo."calculatedIsCorrect" IS TRUE AND qa."questionOptionId" = qo.id) > 0 AS "isSubjectiveCorrect"
    FROM
        public."Question" q
        JOIN public."QuestionOption" qo ON q.id = qo."questionId"
        JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
    GROUP BY qo."questionId", qa."userId"
)
SELECT
    qi."questionId",
    ai."userId",
    CASE
    WHEN ai."hasSeenQuestion" THEN
        CASE
        WHEN ai."hasAnsweredFirstOrder" AND ai."hasAnsweredSecondOrder" THEN
            CASE WHEN qi."isObjective" IS TRUE THEN
              CASE WHEN ai."isObjectiveCorrect" THEN
                'correct'
              ELSE
                'incorrect'
              END
            ELSE
              CASE WHEN ai."isSubjectiveCorrect" THEN
                'correct'
              ELSE
                'incorrect'
              END
            END
        -- If first order but no second order, the
        -- response is considered incomplete
        WHEN ai."hasAnsweredFirstOrder" THEN
            'incomplete'
        ELSE
            'unanswered'
        END
    ELSE
        'unseen'
    END
    AS "indicatorType"
FROM
    public."QuestionInfo" qi
LEFT JOIN public."AnswerInfo" ai
ON ai."questionId" = qi."questionId";
