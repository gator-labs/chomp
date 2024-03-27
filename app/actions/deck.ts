"use server";
import { getJwtPayload } from "./jwt";
import { QuestionAnswer } from "@prisma/client";
import prisma from "../services/prisma";

export type DeckRequest = {
  questionId: number;
  questionOptionId: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
};

export async function saveDeck(request: DeckRequest[]) {
  const payload = await getJwtPayload();
  const questionIds = request.map((dr) => dr.questionId);
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: { in: questionIds } },
  });

  const questionAnswers = questionOptions.map(
    (qo) =>
      ({
        percentage:
          request.find((r) => r.questionOptionId === qo.id)?.percentageGiven ??
          0,
        selected: request.some((r) => r.questionOptionId === qo.id),
        questionOptionId: qo.id,
        userId: payload?.sub ?? "",
      }) as QuestionAnswer
  );

  const response = await prisma.questionAnswer.createMany({
    data: questionAnswers,
  });
}
