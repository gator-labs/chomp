import { chargeUserCredits } from "@/app/actions/fungible-asset";
import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { AnswerStatus } from "@prisma/client";

export async function markQuestionAsSeenButNotAnswered(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  const CREDIT_COST_FEATURE_FLAG =
    process.env.NEXT_PUBLIC_FF_CREDIT_COST_PER_QUESTION === "true";

  try {
    await prisma.questionAnswer.createMany({
      data: questionOptions.map((qo) => ({
        questionOptionId: qo.id,
        userId,
        status: AnswerStatus.Viewed,
        selected: false,
      })),
    });

    if (CREDIT_COST_FEATURE_FLAG) {
      chargeUserCredits(questionId);
    }
  } catch {
    return { hasError: true };
  }
}
