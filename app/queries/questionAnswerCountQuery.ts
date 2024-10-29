import { Prisma } from "@prisma/client";

import prisma from "../services/prisma";

type QuestionAnswerCount = {
  id: number;
  count: number;
};

export async function questionAnswerCountQuery(questionIds: number[]) {
  if (!questionIds.length) {
    return [];
  }

  const questionAnswerCountQuery: QuestionAnswerCount[] =
    await prisma.$queryRaw`
              select 
                q."id",
                (
                    select count(*)
                    from public."QuestionOption" qo
                    join public."QuestionAnswer" qa on qo."id" = qa."questionOptionId"
                    where qo."questionId" = q."id" and qa."selected" = true
                ) as "answerCount"
              from public."Question" q
              where q."id" in (${Prisma.join(questionIds)})
            `;

  return questionAnswerCountQuery.map((q) => ({
    id: q.id,
    count: Number(q.count ?? 0),
  }));
}
