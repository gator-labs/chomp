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
    SELECT
      "id",
      "answerCount",
      "revealAtDate",
      "revealAtAnswerCount"
    FROM (
      SELECT
        q.id,
        "revealAtDate",
        "revealAtAnswerCount",
        (
          SELECT
            COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
          FROM
            "QuestionOption" qo
          JOIN
            "QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
          WHERE
            qo."questionId" = q."id"
      ) AS "answerCount"
      FROM
        "Question" q
      LEFT JOIN
        "QuestionOption" qo ON q.id = qo."questionId"
      LEFT JOIN
        "QuestionAnswer" qa ON qo.id = qa."questionOptionId"
      WHERE
        ("calculatedIsCorrect" IS NULL OR "calculatedAveragePercentage" IS NULL)
      GROUP BY q.id
    )
    WHERE (
      (
        ("revealAtDate" IS NOT NULL AND "revealAtDate" < NOW())
        OR ("revealAtAnswerCount" IS NOT NULL AND "revealAtAnswerCount" >= "answerCount")
      ) AND (
        "answerCount" >= ${Number(process.env.MINIMAL_ANSWERS_PER_QUESTION)}
      )
    )
  `;
}
