import { EThreatLevelType } from "@/types/bots";
import { Prisma } from "@prisma/client";

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
                    join public."User" u on subQa."userId" = u."id"
                    where subQa.selected = true and subQa."questionOptionId" = qo."id" and subQa."status" = 'Submitted' and (u."threatLevel" IS NULL OR u."threatLevel" IN (${EThreatLevelType.ManualAllow}, ${EThreatLevelType.PermanentAllow}))
                  ) 
                  /
                  NULLIF(
                    (
                      select count(*)
                      from public."QuestionAnswer" subQa
                      join public."User" u on subQa."userId" = u."id"
                      where subQa."questionOptionId" = qo."id" and subQa."status" = 'Submitted'and (u."threatLevel" IS NULL OR u."threatLevel" IN (${EThreatLevelType.ManualAllow}, ${EThreatLevelType.PermanentAllow}))
                    )
                  , 0)
                  * 100) as "firstOrderSelectedAnswerPercentage",
                (
                  select round(avg(percentage))
                  from public."QuestionAnswer"
                  join public."User" u on "userId" = u."id"
                  where "questionOptionId" = qo."id" and "status" = 'Submitted' and (u."threatLevel" IS NULL OR u."threatLevel" IN (${EThreatLevelType.ManualAllow}, ${EThreatLevelType.PermanentAllow}))
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

/**
 * Gets question order percentages from the questionOption percentages table if they exist,
 * or calculates them from user question answers if they don't.
 */
export async function getQuestionOrderPercentages(
  questionOptionIds: number[],
  calculatedQuestionOptionPercentages: {
    id: number;
    firstOrderSelectedAnswerPercentage: number | null;
    secondOrderAveragePercentagePicked: number | null;
  }[],
) {
  const isNullCalculatedPercentages = calculatedQuestionOptionPercentages.some(
    (qo) =>
      qo.firstOrderSelectedAnswerPercentage === null ||
      qo.secondOrderAveragePercentagePicked === null,
  );

  if (isNullCalculatedPercentages) {
    return await answerPercentageQuery(questionOptionIds);
  } else {
    return calculatedQuestionOptionPercentages.map((cqop) => ({
      id: cqop.id,
      firstOrderSelectedAnswerPercentage: Number(
        cqop.firstOrderSelectedAnswerPercentage ?? 0,
      ),
      secondOrderAveragePercentagePicked: Number(
        cqop.secondOrderAveragePercentagePicked ?? 0,
      ),
    }));
  }
}
