"use client";
import { claimQuestions } from "@/app/actions/claim";
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
}

const RewardShow = ({
  rewardAmount,
  questionIds,
  status,
  questions,
}: RewardShowProps) => {
  const { isClaiming, setIsClaiming } = useClaiming();
  const queryClient = useQueryClient();

  const { fire } = useConfetti();
  const { promiseToast } = useToast();

  const onClaim = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_STARTED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      promiseToast(claimQuestions(questionIds), {
        loading: "Claiming your rewards...",
        success: "You have successfully claimed your rewards!",
        error: "Failed to claim rewards. Please try again.",
      })
        .then((res) => {
          sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_SUCCEEDED, {
            [MIX_PANEL_METADATA.QUESTION_ID]: res?.questionIds,
            [MIX_PANEL_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
            [MIX_PANEL_METADATA.TRANSACTION_SIGNATURE]:
              res?.transactionSignature,
            [MIX_PANEL_METADATA.QUESTION_TEXT]: res?.questions,
            [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
          });
          queryClient.resetQueries({ queryKey: ["questions-history"] });
          fire();
        })
        .finally(() => {
          setIsClaiming(false);
        });
    } catch (error) {
      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_FAILED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });
    }
  };

  if (rewardAmount > 0) {
    return (
      <div className="flex bg-gray-800 p-4 rounded-lg justify-between">
        <div className="flex flex-col gap-4 w-max justify-between">
          <span className="text-xl font-bold text-left">
            {rewardAmount === 5000 ? "Well done!" : "Congrats, you won!"}
          </span>
          <div className="h-[1px] w-full bg-gray-600" />
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
                {numberToCurrencyFormatter.format(Math.floor(rewardAmount))}{" "}
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
    <div className="p-4 flex bg-gray-800 rounded-md justify-between">
      <div className="flex flex-col gap-4 w-max justify-between">
        <span className="text-xl font-bold text-left">
          Better luck next time!
        </span>
        <div className="h-[1px] w-full bg-gray-600" />
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
