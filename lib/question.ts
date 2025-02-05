import prisma from "@/app/services/prisma";

/**
 * Determines if the given question was answered and paid for
 * by the user, and that we have a calculated correct answer.
 *
 * @param userId     User ID.
 * @param questionId Question ID.
 *
 * @return result    true/false.
 */
export async function isQuestionCalculatedAndPaidFor(
  userId: string,
  questionId: number,
) {
  const questions = await prisma.$queryRaw<
    {
      id: number;
      answerCount: number;
    }[]
  >`
SELECT
    q.id,
    (
        SELECT COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM public."QuestionOption" qo
        JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE qo."questionId" = q."id"
    ) AS "answerCount"
FROM
    public."Question" q
JOIN
    public."FungibleAssetTransactionLog" fatl ON q.id = fatl."questionId"
WHERE
    q."id" = ${questionId}
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND EXISTS (
        SELECT 1
        FROM public."QuestionOption" qo
        JOIN public."QuestionAnswer" qa ON qo.id = qa."questionOptionId"
        WHERE
            qo."questionId" = q.id
            AND qa.selected = TRUE
            AND (qo."calculatedIsCorrect" IS NOT NULL OR qo."calculatedAveragePercentage" IS NOT NULL)
            AND qa."userId" = ${userId}
    )
    AND fatl."userId" = ${userId}
    AND fatl."change" = -q."creditCostPerQuestion"
    AND fatl."type" = 'PremiumQuestionCharge'
    AND fatl."change" < 0;
`;

  if (!questions.length) return false;

  return (
    questions[0].answerCount &&
    questions[0].answerCount >=
      Number(process.env.MINIMAL_ANSWERS_PER_QUESTION || 0)
  );
}
