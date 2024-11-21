"use client";

import { revealQuestion, revealQuestions } from "@/app/actions/chompResult";
import { RevealProps } from "@/app/hooks/useReveal";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { Button } from "../../Button/Button";
import { getTotalRevealTokenAmount } from "./helpers";

type PotentialRewardsRevealAllProps = {
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[];
  deckId?: number;
};

export default function PotentialRewardsRevealAll({
  revealableQuestions,
  deckId,
}: PotentialRewardsRevealAllProps) {
  const totalRevealTokenAmount = getTotalRevealTokenAmount(revealableQuestions);
  const maxRewardPerQuestion = totalRevealTokenAmount * 2;

  // const [optimisticMaxRewardPerQuestion, revealOptimistic] = useOptimistic(
  //   maxRewardPerQuestion,
  //   (_, optimisticValue: number) => optimisticValue,
  // );

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { openRevealModal, closeRevealModal } = useRevealedContext();

  const revealAll = useCallback(
    async ({ burnTx, revealQuestionIds, pendingChompResults }: RevealProps) => {
      setIsLoading(true);

      await Promise.all([
        ...(revealQuestionIds
          ? [revealQuestions(revealQuestionIds, burnTx)]
          : []),
        ...(pendingChompResults?.map((result) =>
          revealQuestion(result.id, result.burnTx),
        ) || []),
      ]);

      // startTransition(() => {
      //   revealOptimistic(0);
      // });

      queryClient.resetQueries({
        queryKey: [
          deckId ? `questions-history-${deckId}` : "questions-history",
        ],
      });
      closeRevealModal();
      setIsLoading(false);
    },
    [],
  );

  const handleRevealAll = useCallback(
    () =>
      openRevealModal({
        reveal: revealAll,
        amount: revealableQuestions.reduce(
          (curr, acc) => curr + acc.revealTokenAmount,
          0,
        ),
        questionIds: revealableQuestions.map((q) => q.id),
        questions: revealableQuestions.map((q) => q.question),
      }),
    [],
  );

  return (
    <div className="flex justify-between ">
      <div className="flex flex-col justify-between gap-[10px]">
        <div className="text-xs text-white  ">Potential Rewards</div>
        <div className="text-base text-white  font-semibold ">
          {numberToCurrencyFormatter.format(maxRewardPerQuestion)} BONK
        </div>
      </div>
      {maxRewardPerQuestion !== 0 && (
        <Button
          onClick={handleRevealAll}
          disabled={isLoading}
          variant="white"
          size="small"
          isPill
          className="!w-fit h-[29px] px-4 text-xs"
        >
          Reveal All Chomped Cards
        </Button>
      )}
    </div>
  );
}
