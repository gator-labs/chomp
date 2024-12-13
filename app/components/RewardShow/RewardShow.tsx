"use client";

import { claimQuestions } from "@/app/actions/claim";
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
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";

import BulkIcon from "../Icons/BulkIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import Trophy from "../Icons/Trophy";
import RewardInfoBox from "../InfoBoxes/RevealPage/RewardInfoBox";
import Pill from "../Pill/Pill";

interface RewardShowProps {
  rewardAmount: number;
  questionIds: number[];
  status: "claimable" | "claimed";
  questions: string[];
  revealAmount: number;
}

const RewardShow = ({
  rewardAmount,
  questionIds,
  status,
  questions,
  revealAmount,
}: RewardShowProps) => {
  const { isClaiming, setIsClaiming } = useClaiming();
  const queryClient = useQueryClient();

  const { fire } = useConfetti();
  const { promiseToast } = useToast();

  const onClaim = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);

      trackEvent(TRACKING_EVENTS.CLAIM_STARTED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      promiseToast(claimQuestions(questionIds), {
        loading: "Claiming your rewards...",
        success: "You have successfully claimed your rewards!",
        error: "Failed to claim rewards. Please try again.",
      })
        .then((res) => {
          trackEvent(TRACKING_EVENTS.CLAIM_SUCCEEDED, {
            [TRACKING_METADATA.QUESTION_ID]: res?.questionIds,
            [TRACKING_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
            [TRACKING_METADATA.TRANSACTION_SIGNATURE]:
              res?.transactionSignature,
            [TRACKING_METADATA.QUESTION_TEXT]: res?.questions,
            [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
          });
          queryClient.resetQueries({ queryKey: ["questions-history"] });
          fire();
        })
        .finally(() => {
          setIsClaiming(false);
        });
    } catch {
      trackEvent(TRACKING_EVENTS.CLAIM_FAILED, {
        [TRACKING_METADATA.QUESTION_ID]: questionIds,
        [TRACKING_METADATA.QUESTION_TEXT]: questions,
        [TRACKING_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });
    }
  };

  if (rewardAmount > 0) {
    return (
      <div className="flex bg-gray-700 p-4 rounded-lg justify-between">
        <div className="flex flex-col gap-4 w-max justify-between">
          <span className="text-xl font-bold text-left">
            {rewardAmount === revealAmount
              ? "Well done!"
              : "Congrats, you won!"}
          </span>
          <div className="h-[1px] w-full bg-gray-500" />
          <div className="flex items-center gap-1 justify-between">
            <p className="text-sm font-normal  text-left">Claim reward:</p>
            <Pill
              onClick={async () =>
                status === "claimable" && !isClaiming && onClaim()
              }
              variant="white"
              className={classNames({
                "opacity-50 cursor-not-allowed": isClaiming,
                "!cursor-auto": status === "claimed",
                "!cursor-pointer": status === "claimable",
              })}
            >
              <p className="text-xs font-bold  text-center ">
                {numberToCurrencyFormatter.format(
                  Math.round(rewardAmount || 0),
                )}{" "}
                BONK
              </p>
            </Pill>
            <RewardInfoBox />
          </div>
        </div>
        <Trophy width={70} height={85} />
      </div>
    );
  }

  return (
    <div className="p-4 flex bg-gray-700 rounded-md justify-between">
      <div className="flex flex-col gap-4 w-max justify-between">
        <span className="text-xl font-bold text-left">
          Better luck next time!
        </span>
        <div className="h-[1px] w-full bg-gray-500" />
        <div className="flex items-center gap-1 justify-start">
          <p className="text-sm font-normal  text-left">Claim reward:</p>
          <Pill variant="white" className="!cursor-auto">
            <p className="text-xs font-bold  text-center ">0 BONK</p>
          </Pill>
          <InfoIcon height={24} width={24} className="ml-1" />
        </div>
      </div>
      <BulkIcon width={74} height={74} />
    </div>
  );
};

export default RewardShow;
