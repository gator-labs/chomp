"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getRandomInteger } from "@/app/utils/randomUtils";
import { chargeUserCredits } from "@/lib/credits/chargeUserCredits";
import { AnswerStatus } from "@prisma/client";

export async function markQuestionAsSeenButNotAnswered(
  questionId: number,
  max: number,
) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await chargeUserCredits(questionId);

    const random = getRandomInteger(0, max) + 1;

    const answerData = questionOptions.map((qo) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      isRandomOption: random === qo.id,
      selected: false,
    }));
    await prisma.questionAnswer.createMany({
      data: answerData,
    });
  } catch (error) {
    console.log("Error in markQuestionAsSeenButNotAnswered", error);
    return { hasError: true };
  }
}
