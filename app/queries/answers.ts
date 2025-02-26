import prisma from "@/app/services/prisma";

/**
 * Finds questions in the database which are ready to
 * reveal and require the correct answer to be calculated.
 */
export async function getQuestionsNeedingCorrectAnswer() {
  if (
    process.env.MINIMAL_ANSWERS_PER_QUESTION === null ||
    process.env.MINIMAL_ANSWERS_PER_QUESTION === undefined
  )
    throw new Error("Missing value for MINIMAL_ANSWERS_PER_QUESTION");

  return await prisma.$queryRaw<
    {
      id: number;
      answerCount: number;
      revealAtDate: number;
      revealAtAnswerCount: number;
    }[]
  >`
      WITH AnswerCounts AS (
          SELECT qo."questionId",
                 COUNT(DISTINCT qa."userId") AS "answerCount"
          FROM "QuestionOption" qo
                   JOIN "QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
          WHERE qo."calculatedIsCorrect" IS NULL OR qo."calculatedAveragePercentage" IS NULL
          GROUP BY qo."questionId"
      )
      SELECT q.id,
             q."revealAtDate",
             q."revealAtAnswerCount",
             sub."answerCount"
      FROM "Question" q
               JOIN AnswerCounts sub ON sub."questionId" = q.id
      WHERE
          (q."revealAtDate" IS NOT NULL AND q."revealAtDate" < NOW())
         OR
          ((q."revealAtAnswerCount" IS NOT NULL AND q."revealAtAnswerCount" <= sub."answerCount")
              AND sub."answerCount" >= ${Number(process.env.MINIMAL_ANSWERS_PER_QUESTION)});
  `;
}
