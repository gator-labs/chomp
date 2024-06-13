import { Prisma } from "@prisma/client";
import prisma from "../services/prisma";

type QuestionOptionPercentage = {
  id: number;
  firstOrderSelectedAnswerPercentage: number | null;
  secondOrderAveragePercentagePicked: number | null;
};

export async function answerPercentageQuery(questionOptionIds: number[]) {
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
                    where subQa.selected = true and subQa."questionOptionId" = qo."id" and subQa."hasViewedButNotSubmitted" = false
                  ) 
                  /
                  NULLIF(
                    (
                      select count(*)
                      from public."QuestionAnswer" subQa
                      where subQa."questionOptionId" = qo."id" and subQa."hasViewedButNotSubmitted" = false
                    )
                  , 0)
                  * 100) as "firstOrderSelectedAnswerPercentage",
                (
                  select round(avg(percentage))
                  from public."QuestionAnswer"
                  where "questionOptionId" = qo."id" and "hasViewedButNotSubmitted" = false
                ) as "secondOrderAveragePercentagePicked"
              from public."QuestionOption" qo
              where qo."id" in (${Prisma.join(questionOptionIds)})
            `;

  return questionOptionPercentages.map((qo) => ({
    id: qo.id,
    firstOrderSelectedAnswerPercentage: Number(
      qo.firstOrderSelectedAnswerPercentage ?? 0,
    ),
    secondOrderAveragePercentagePicked: Number(
      qo.secondOrderAveragePercentagePicked ?? 0,
    ),
  }));
}
