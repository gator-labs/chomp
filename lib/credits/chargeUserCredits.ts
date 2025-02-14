import { getUserTotalCreditAmount } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { authGuard } from "@/app/utils/auth";
import { FungibleAsset, TransactionLogType } from "@prisma/client";

import { InsufficientCreditsError } from "../error";

// charge user credits for premium decks/questions
export const chargeUserCredits = async (questionId: number) => {
  const payload = await authGuard();

  const creditForQuestion = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    select: {
      creditCostPerQuestion: true,
    },
  });

  if (!creditForQuestion) {
    throw new Error(`Question with id ${questionId} not found`);
  }

  const creditCostPerQuestion = creditForQuestion.creditCostPerQuestion;
  if (creditCostPerQuestion === null) return;

  const userTotalCreditAmount = await getUserTotalCreditAmount();

  if (userTotalCreditAmount < creditCostPerQuestion) {
    throw new InsufficientCreditsError(
      `User has insufficient credits to charge for question ${questionId}`,
    );
  }

  await prisma.fungibleAssetTransactionLog.create({
    data: {
      type: TransactionLogType.PremiumQuestionCharge,
      questionId: questionId,
      asset: FungibleAsset.Credit,
      change: -Math.abs(creditCostPerQuestion),
      userId: payload.sub,
    },
  });
};
