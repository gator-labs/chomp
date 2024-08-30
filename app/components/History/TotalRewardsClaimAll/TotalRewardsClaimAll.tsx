"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { MIX_PANEL_EVENTS } from "@/app/constants/mixpanel";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import sendToMixpanel from "@/lib/mixpanel";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic } from "react";
import { Button } from "../../Button/Button";

type TotalRewardsClaimAllProps = {
  totalRevealedRewards: number;
};

export default function TotalRewardsClaimAll({
  totalRevealedRewards,
}: TotalRewardsClaimAllProps) {
  const [optimisticAmount, claimOptimistic] = useOptimistic(
    totalRevealedRewards,
    (_, optimisticValue: number) => optimisticValue,
  );
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClaimAll = async () => {
    setIsClaiming(true);
    const res = await promiseToast(
      claimAllAvailable(),
      {
        loading: "Claim in progress. Please wait...",
        success: "Funds are transferred!",
        error: "Issue transferring funds.",
        isChompLoader: true,
      },
      { duration: Infinity },
    );

    sendToMixpanel(MIX_PANEL_EVENTS.QUESTION_REWARD_CLAIMED, {
      questionIds: res?.questionIds,
      claimedAmount: res?.claimedAmount,
      transactionSignature: res?.transactionSignature,
      questions: res?.questions,
    });

    startTransition(() => {
      claimOptimistic(0);
    });
    queryClient.resetQueries({ queryKey: ["questions-history"] });

    fire();
    successToast(
      "Claimed!",
      `You have successfully claimed ${numberToCurrencyFormatter.format(totalRevealedRewards)} BONK!`,
    );
    setIsClaiming(false);
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between gap-[10px]">
        <p className="text-xs text-white leading-[7px]">Claimable rewards</p>
        <p className="text-base text-white leading-[12px]">
          {numberToCurrencyFormatter.format(optimisticAmount)} BONK
        </p>
      </div>
      {optimisticAmount !== 0 && (
        <Button
          onClick={onClaimAll}
          disabled={isClaiming}
          variant="white"
          size="small"
          isPill
          className="!w-fit h-[29px] px-4 text-xs"
        >
          Claim all
        </Button>
      )}
    </div>
  );
}
