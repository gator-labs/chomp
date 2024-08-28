"use client";
import { claimQuestions } from "@/app/actions/claim";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { CONNECTION } from "@/app/utils/solana";
import { useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { Button } from "../Button/Button";
import { DollarIcon } from "../Icons/DollarIcon";
import RewardInfoBox from "../InfoBoxes/RevealPage/RewardInfoBox";
import Pill from "../Pill/Pill";
import sendToMixpanel from "@/lib/mixpanel";
import { MIX_PANEL_EVENTS } from "@/app/constants/mixpanel";

interface ClaimButtonProps {
  status: "claimable" | "claimed" | "unclaimable";
  className?: string;
  rewardAmount?: number;
  didAnswer?: boolean;
  questionIds: number[];
  transactionHash?: string;
}

const ClaimButton = ({
  status,
  className,
  rewardAmount,
  didAnswer = true,
  questionIds,
  transactionHash,
}: ClaimButtonProps) => {
  const { fire } = useConfetti();
  const { promiseToast, errorToast } = useToast();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClick = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);

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
          sendToMixpanel(MIX_PANEL_EVENTS.QUESTION_REWARD_CLAIMED, {
            questionIds: res?.questionIds,
            claimedAmount: res?.claimedAmount,
            transactionSignature: res?.transactionSignature,
          });
          queryClient.resetQueries({ queryKey: ["questions-history"] });
          fire();
        })
        .finally(() => {
          setIsClaiming(false);
        });
    } catch (error) {
      errorToast("Failed to claim rewards. Please try again.");
    }
  };

  if (!didAnswer) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-[#666666]">
          You did not participate in this Chomp
        </p>
        <div className="flex flex-col gap-4 w-full">
          <Button
            variant="grayish"
            className="items-center gap-1 h-[50px] !bg-[#999999] !text-[#666666] cursor-auto"
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
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(Math.floor(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <Button
            className={classNames(
              "text-[13px] font-semibold leading-[16.38px] text-left flex items-center justify-center",
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
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            You have claimed:
          </p>
          <Pill variant="white" className="!cursor-auto">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
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
              "!bg-[#999999] text-[13px] font-semibold leading-[16.38px] text-left flex items-center justify-center border-none",
              className,
            )}
          >
            <span className="text-[#666666]">Claimed</span>
            <DollarIcon height={24} width={24} fill="#666666" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-[13px] font-normal leading-[17.55px] text-left">
          Your claimable reward:
        </p>
        <Pill variant="white" className="!cursor-auto">
          <span className="text-[10px] font-bold leading-[12.6px] text-left">
            0 BONK
          </span>
        </Pill>
        <RewardInfoBox />
      </div>
      <div className="flex flex-col gap-4 w-full">
        <Button
          disabled
          className={classNames(
            "!bg-[#999999] text-[13px] font-semibold leading-[16.38px] text-left flex items-center justify-center border-none",
            className,
          )}
        >
          <span className="text-[#666666]">Unclaimable</span>
          <DollarIcon height={24} width={24} fill="#666666" />
        </Button>
      </div>
    </div>
  );
};

export default ClaimButton;
