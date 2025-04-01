"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getRandomInteger } from "@/app/utils/randomUtils";
import { chargeUserCredits } from "@/lib/credits/chargeUserCredits";
import { AnswerStatus, QuestionType } from "@prisma/client";

export async function markQuestionAsSeenButNotAnswered(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
    include: {
      question: true,
    },
  });

  try {
    await chargeUserCredits(questionId);

    const numOptions =
      questionOptions.length > 0 ? questionOptions.length - 1 : 0;

    const random = getRandomInteger(0, numOptions);

    const answerData = questionOptions.map((qo, index) => ({
      questionOptionId: qo.id,
      userId,
      status: AnswerStatus.Viewed,
      isAssigned2ndOrderOption:
        index === random &&
        questionOptions[0].question.type === QuestionType.MultiChoice,
      selected: false,
    }));
    await prisma.questionAnswer.createMany({
      data: answerData,
    });
    return {
      random:
        questionOptions[0].question.type === QuestionType.MultiChoice
          ? random
          : 0,
    };
  } catch (error) {
    console.log("Error in markQuestionAsSeenButNotAnswered", error);
    return { hasError: true };
  }
}
