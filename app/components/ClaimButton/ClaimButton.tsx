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
import { CONNECTION } from "@/app/utils/solana";
import sendToMixpanel from "@/lib/mixpanel";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { Button } from "../Button/Button";
import { DollarIcon } from "../Icons/DollarIcon";
import RewardInfoBox from "../InfoBoxes/RevealPage/RewardInfoBox";
import Pill from "../Pill/Pill";

interface ClaimButtonProps {
  status: "claimable" | "claimed" | "unclaimable";
  className?: string;
  rewardAmount?: number;
  didAnswer?: boolean;
  questionIds: number[];
  questions?: string[];
  transactionHash?: string;
}

const ClaimButton = ({
  status,
  className,
  rewardAmount,
  didAnswer = true,
  questionIds,
  transactionHash,
  questions,
}: ClaimButtonProps) => {
  const { fire } = useConfetti();
  const { promiseToast, errorToast } = useToast();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClick = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_STARTED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: questionIds,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: questions,
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.SINGLE,
      });

      const tx = await CONNECTION.getTransaction(transactionHash!, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) return errorToast("Cannot get transaction");

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
      errorToast("Failed to claim rewards. Please try again.");
    }
  };

  if (!didAnswer) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-gray-600">
          You did not participate in this Chomp
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="grayish"
            className="items-center gap-1 h-[50px] !bg-gray-400 !text-gray-600 cursor-auto"
            disabled
          >
            Claim <DollarIcon fill="#666666" />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "claimable" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm font-normal text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-xs font-bold text-left">
              {numberToCurrencyFormatter.format(Math.floor(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            className={classNames(
              "text-sm font-semibold text-left flex items-center justify-center",
              className,
              { "cursor-not-allowed opacity-50": isClaiming },
            )}
            variant="purple"
            onClick={onClick}
            disabled={isClaiming}
          >
            <span>Claim</span>
            <DollarIcon height={24} width={24} />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "claimed" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm font-normal  text-left">You have claimed:</p>
          <Pill variant="white" className="!cursor-auto">
            <span className="text-xs font-bold  text-left">
              {numberToCurrencyFormatter.format(Math.floor(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            disabled
            className={classNames(
              "!bg-gray-400 text-sm font-semibold  text-left flex items-center justify-center border-none",
              className,
            )}
          >
            <span className="text-gray-600">Claimed</span>
            <DollarIcon height={24} width={24} fill="#666666" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-sm font-normal  text-left">Your claimable reward:</p>
        <Pill variant="white" className="!cursor-auto">
          <span className="text-xs font-bold  text-left">0 BONK</span>
        </Pill>
        <RewardInfoBox />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button
          disabled
          className={classNames(
            "!bg-gray-400 text-sm font-semibold  text-left flex items-center justify-center border-none",
            className,
          )}
        >
          <span className="text-gray-600">Unclaimable</span>
          <DollarIcon height={24} width={24} fill="#666666" />
        </Button>
      </div>
    </div>
  );
};

export default ClaimButton;
