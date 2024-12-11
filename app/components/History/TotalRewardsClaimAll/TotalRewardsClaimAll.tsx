"use client";

import { claimAllAvailable } from "@/app/actions/claim";
import {
  REVEAL_TYPE,
  TRACKING_EVENTS,
  TRACKING_METADATA,
} from "@/app/constants/tracking";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import trackEvent from "@/lib/trackEvent";
import { getClaimAllShareUrl } from "@/lib/urls";
import { Question } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic, useState } from "react";

import { Button } from "../../Button/Button";
import ClaimShareDrawer from "../../ClaimShareDrawer/ClaimShareDrawer";

type TotalRewardsClaimAllProps = {
  totalClaimableRewards?: {
    questions: (Question | null)[];
    totalClaimableRewards: number;
  };
  profileImg: string;
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
  const [claimResult, setClaimResult] = useState({
    claimedAmount: 0,
    correctAnswers: 0,
    questionsAnswered: 0,
    transactionHash: "",
  });
  const [isClaimShareDrawerOpen, setIsClaimShareDrawerOpen] = useState(false);
  const [mysteryBoxId, setMysteryBoxId] = useState<string | null>(null);

  const onClaimAll = async () => {
    try {
      setIsClaiming(true);

      trackEvent(TRACKING_EVENTS.CLAIM_STARTED, {
        [TRACKING_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [TRACKING_METADATA.QUESTION_TEXT]: totalClaimableRewards?.questions.map(
          (q) => q?.question,
        ),
        [TRACKING_METADATA.QUESTION_TEXT]: totalClaimableRewards?.questions.map(
          (q) => q?.question,
        ),
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });

      const res = await promiseToast(claimAllAvailable(), {
        loading: "Claim in progress. Please wait...",
        success: "Funds are transferred!",
        error: "Issue transferring funds.",
      });

      trackEvent(TRACKING_EVENTS.CLAIM_SUCCEEDED, {
        [TRACKING_METADATA.QUESTION_ID]: res?.questionIds,
        [TRACKING_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
        [TRACKING_METADATA.TRANSACTION_SIGNATURE]: res?.transactionSignature,
        [TRACKING_METADATA.QUESTION_TEXT]: res?.questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
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
        `You have successfully claimed ${numberToCurrencyFormatter.format(
          totalClaimableRewards?.totalClaimableRewards || 0,
        )} BONK!`,
      );
      setIsClaiming(false);
      setIsClaimShareDrawerOpen(true);
      if (res?.mysteryBoxId) {
        setMysteryBoxId(res.mysteryBoxId);
      }

      if (
        res?.claimedAmount &&
        res?.correctAnswers &&
        res?.numberOfAnsweredQuestions &&
        res?.transactionSignature
      ) {
        const {
          claimedAmount,
          correctAnswers,
          numberOfAnsweredQuestions,
          transactionSignature,
        } = res;
        setClaimResult({
          claimedAmount,
          correctAnswers,
          questionsAnswered: numberOfAnsweredQuestions,
          transactionHash: transactionSignature,
        });
      }
    } catch (error) {
      console.error(error);
      trackEvent(TRACKING_EVENTS.CLAIM_FAILED, {
        [TRACKING_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [TRACKING_METADATA.QUESTION_TEXT]: totalClaimableRewards?.questions.map(
          (q) => q?.question,
        ),
        [TRACKING_METADATA.QUESTION_TEXT]: totalClaimableRewards?.questions.map(
          (q) => q?.question,
        ),
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });
    } finally {
      setIsClaiming(false);
    }
  };

  const copyUrl = getClaimAllShareUrl(
    claimResult.transactionHash.substring(0, 10),
  );

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

      <ClaimShareDrawer
        variant="all"
        isOpen={isClaimShareDrawerOpen}
        copyUrl={copyUrl}
        onClose={() => setIsClaimShareDrawerOpen(false)}
        description={`You just claimed ${claimResult.claimedAmount.toLocaleString("en-US")} BONK from ${claimResult.questionsAnswered} cards!`}
        mysteryBoxId={mysteryBoxId}
      />
    </div>
  );
}
