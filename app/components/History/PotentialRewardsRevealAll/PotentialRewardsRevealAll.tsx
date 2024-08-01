"use client";
import { revealQuestions } from "@/app/actions/chompResult";
import { useRevealedContext } from "@/app/providers/RevealProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Button } from "../../Button/Button";

type PotentialRewardsRevealAllProps = {
  revealableQuestions: {
    id: number;
    revealTokenAmount: number;
  }[];
};

export default function PotentialRewardsRevealAll({
  revealableQuestions,
}: PotentialRewardsRevealAllProps) {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const { openRevealModal, closeRevealModal } = useRevealedContext();

  const revealAll = useCallback(
    async (burnTx?: string, nftAddress?: string) => {
      setIsLoading(true);
      await revealQuestions(
        revealableQuestions.map((q) => q.id),
        burnTx,
        nftAddress,
      );
      queryClient.resetQueries({ queryKey: ["questions-history"] });
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
      }),
    [],
  );

  return (
    <div className="flex justify-between ">
      <div className="flex flex-col justify-between gap-[10px]">
        <div className="text-xs text-white font-sora leading-[7px]">
          Potential Rewards
        </div>
        <div className="text-base text-white font-sora font-semibold leading-[12px]">
          {numberToCurrencyFormatter.format(revealableQuestions.length * 10000)}{" "}
          BONK
        </div>
      </div>
      {revealableQuestions.length * 10000 !== 0 && (
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
