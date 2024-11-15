import { DOUBLE } from "./constants";

export function getSmallestRevealTokenAmount(
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[],
): number {
  if (revealableQuestions.length === 0) {
    return 0;
  }

  return revealableQuestions.reduce(
    (min, question) =>
      question.revealTokenAmount < min ? question.revealTokenAmount : min,
    revealableQuestions[0].revealTokenAmount,
  );
}

export function getMaxRewardPerQuestion(revealAmount: number) {
  return DOUBLE * revealAmount;
}
