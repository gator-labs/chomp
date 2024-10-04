"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import {
  MIX_PANEL_EVENTS,
  MIX_PANEL_METADATA,
  REVEAL_TYPE,
} from "@/app/constants/mixpanel";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import sendToMixpanel from "@/lib/mixpanel";
import { Question } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic } from "react";
import { Button } from "../../Button/Button";

type TotalRewardsClaimAllProps = {
  totalClaimableRewards?: {
    questions: (Question | null)[];
    totalClaimableRewards: number;
  };
  deckId?: number;
};

export default function TotalRewardsClaimAll({
  totalClaimableRewards,
  deckId,
}: TotalRewardsClaimAllProps) {
  const [optimisticAmount, claimOptimistic] = useOptimistic(
    totalClaimableRewards?.totalClaimableRewards || 0,
    (_, optimisticValue: number) => optimisticValue,
  );
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClaimAll = async () => {
    try {
      setIsClaiming(true);

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_STARTED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [MIX_PANEL_METADATA.QUESTION_TEXT]:
          totalClaimableRewards?.questions.map((q) => q?.question),
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });

      const res = await promiseToast(claimAllAvailable(), {
        loading: "Claim in progress. Please wait...",
        success: "Funds are transferred!",
        error: "Issue transferring funds.",
      });

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_SUCCEEDED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: res?.questionIds,
        [MIX_PANEL_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
        [MIX_PANEL_METADATA.TRANSACTION_SIGNATURE]: res?.transactionSignature,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: res?.questions,
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });

      startTransition(() => {
        claimOptimistic(0);
      });
      queryClient.resetQueries({
        queryKey: [
          deckId ? `questions-history-${deckId}` : "questions-history",
        ],
      });
      fire();
      successToast(
        "Claimed!",
        `You have successfully claimed ${numberToCurrencyFormatter.format(totalClaimableRewards?.totalClaimableRewards || 0)} BONK!`,
      );
      setIsClaiming(false);
    } catch (error) {
      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_FAILED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [MIX_PANEL_METADATA.QUESTION_TEXT]:
          totalClaimableRewards?.questions.map((q) => q?.question),
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between gap-[10px]">
        <p className="text-xs text-white ">Claimable rewards</p>
        <p className="text-base text-white ">
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
