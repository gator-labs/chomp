"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { chargeUserCredits } from "@/lib/credits/chargeUserCredits";
import { AnswerStatus } from "@prisma/client";

export async function markQuestionAsSeenButNotAnswered(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await chargeUserCredits(questionId);

    const answerData = questionOptions.map((qo) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
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
