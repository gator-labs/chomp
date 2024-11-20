export function getTotalRevealTokenAmount(
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
    (acc, curr) => acc + curr.revealTokenAmount,
    0,
  );
}
