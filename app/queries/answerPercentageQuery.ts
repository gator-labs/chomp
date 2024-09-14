import { AnswerStatus, Prisma } from "@prisma/client";
import prisma from "../services/prisma";

type QuestionOptionPercentage = {
  id: number;
  firstOrderSelectedAnswerPercentage: number | null;
  secondOrderAveragePercentagePicked: number | null;
};

export async function answerPercentageQuery(questionOptionIds: number[]) {
  const isBinary = questionOptionIds.length === 2;
  if (!questionOptionIds.length) {
    return [];
  }

  const questionOptionPercentages: QuestionOptionPercentage[] =
    await prisma.$queryRaw`
              select 
                qo."id",
                round(
                  1.0 *
                  (
                    select count(*)
                    from public."QuestionAnswer" subQa
                    where subQa.selected = true and subQa."questionOptionId" = qo."id" and subQa."status" = ${AnswerStatus.Submitted}::"AnswerStatus"
                  ) 
                  /
                  NULLIF(
                    (
                      select count(*)
                      from public."QuestionAnswer" subQa
                      where subQa."questionOptionId" = qo."id" and subQa."status" = ${AnswerStatus.Submitted}::"AnswerStatus"
                    )
                  , 0)
                  * 100) as "firstOrderSelectedAnswerPercentage",
                (
                  select round(avg(percentage))
                  from public."QuestionAnswer"
                  where "questionOptionId" = qo."id" and "status" = ${AnswerStatus.Submitted}::"AnswerStatus"
                ) as "secondOrderAveragePercentagePicked"
              from public."QuestionOption" qo
              where qo."id" in (${Prisma.join(questionOptionIds)})
            `;

  return questionOptionPercentages.map((qo, i) => ({
    id: qo.id,
    firstOrderSelectedAnswerPercentage: Number(
      qo.firstOrderSelectedAnswerPercentage ?? 0,
    ),
    secondOrderAveragePercentagePicked: Number(
      isBinary && i === 1
        ? 100 -
            Number(
              questionOptionPercentages[0].secondOrderAveragePercentagePicked ??
                0,
            )
        : (qo.secondOrderAveragePercentagePicked ?? 0),
    ),
  }));
}
