"use client";

import { revealQuestion, revealQuestions } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { RevealProps } from "@/types/reveal";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useCallback, useOptimistic, useState } from "react";

import { Button } from "../../Button/Button";
import { getTotalRevealTokenAmount } from "./helpers";

type PotentialRewardsRevealAllProps = {
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
    question: string;
  }[];
  deckId?: number;
  isMysteryBoxEnabled: boolean;
};

export default function PotentialRewardsRevealAll({
  revealableQuestions,
  deckId,
  isMysteryBoxEnabled,
}: PotentialRewardsRevealAllProps) {
  const totalRevealTokenAmount = getTotalRevealTokenAmount(revealableQuestions);
  const maxRewardPerQuestion = totalRevealTokenAmount * 2;

  const [optimisticMaxRewardPerQuestion, revealOptimistic] = useOptimistic(
    maxRewardPerQuestion,
    (_, optimisticValue: number) => optimisticValue,
  );

  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { openRevealModal, closeRevealModal } = useRevealedContext();

  // Data is passed from the useReveal hook, using reveal?.reveal(...data) for execution.
  const revealAll = useCallback(
    async ({
      burnTx,
      revealQuestionIds,
      pendingChompResults,
      nftAddress,
      nftType,
    }: RevealProps) => {
      setIsLoading(true);
      await Promise.all([
        ...(revealQuestionIds
          ? [
              revealQuestions(
                revealQuestionIds,
                burnTx,
                nftAddress,
                nftType,
                isMysteryBoxEnabled,
              ),
            ]
          : []),
        ...(pendingChompResults?.map((result) =>
          revealQuestion(result.id, result.burnTx),
        ) || []),
      ]);

      startTransition(() => {
        revealOptimistic(0);
      });

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
        isRevealAll: true,
      }),
    [],
  );

  return (
    <div className="flex justify-between ">
      <div className="flex flex-col justify-between gap-[10px]">
        <div className="text-xs text-white  ">Potential Rewards</div>
        <div className="text-base text-white  font-semibold ">
          {numberToCurrencyFormatter.format(optimisticMaxRewardPerQuestion)}{" "}
          BONK
        </div>
      </div>
      {optimisticMaxRewardPerQuestion !== 0 && (
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
