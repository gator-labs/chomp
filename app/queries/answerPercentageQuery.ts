import { Prisma } from "@prisma/client";
import prisma from "../services/prisma";

export async function answerPercentageQuery(questionOptionIds: number[]) {
  const questionOptionPercentages: {
    questionOptionId: number;
    percentageResult: number | null;
  }[] =
    questionOptionIds.length === 0
      ? []
      : await prisma.$queryRaw`
              select 
                qa."questionOptionId",
                floor(
                  (
                    select 
                      count(*)
                    from public."QuestionAnswer" subQa
                    where subQa."questionOptionId" = qa."questionOptionId" 
                  ) 
                /
                  NULLIF(
                    (
                      select 
                        count(*)
                      from public."QuestionAnswer" subQa
                      where subQa.selected = true and subQa."questionOptionId" = qa."questionOptionId"
                    )
                  , 0)
                ) * 100 as "percentageResult"
              from public."QuestionAnswer" qa
              where qa."questionOptionId" in (${Prisma.join(questionOptionIds)})
            `;

  return questionOptionPercentages;
}
