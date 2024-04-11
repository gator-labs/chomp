import { Prisma } from "@prisma/client";
import prisma from "../services/prisma";

type QuestionOptionPercentage = {
  id: number;
  percentageResult: number | null;
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
                    where subQa.selected = true and subQa."questionOptionId" = qo."id" 
                  ) 
                  /
                  NULLIF(
                    (
                      select count(*)
                      from public."QuestionAnswer" subQa
                      where subQa."questionOptionId" = qo."id"
                    )
                  , 0)
                  * 100) as "percentageResult"
              from public."QuestionOption" qo
              where qo."id" in (${Prisma.join(questionOptionIds)})
            `;

  return questionOptionPercentages.map((qo) => ({
    id: qo.id,
    percentageResult: Number(qo.percentageResult),
  }));
}
