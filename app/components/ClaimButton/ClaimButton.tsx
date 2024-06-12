"use client";
import { claimQuestions } from "@/app/actions/claim";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import classNames from "classnames";
import { useState } from "react";
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
}

const ClaimButton = ({
  status,
  className,
  rewardAmount,
  didAnswer = true,
  questionIds,
}: ClaimButtonProps) => {
  const { fire } = useConfetti();
  const { promiseToast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const onClick = async () => {
    if (isClaiming) return;

    setIsClaiming(true);

    promiseToast(claimQuestions(questionIds), {
      loading: "Claiming your rewards...",
      success: "You have successfully claimed your rewards!",
      error: "Failed to claim rewards. Please try again.",
    })
      .then(() => {
        fire();
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  if (!didAnswer) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-[#666666]">
          You did not participate in this Chomp
        </p>
        <Button
          variant="grayish"
          className="items-center gap-1 h-[50px] !bg-[#999999] !text-[#666666] cursor-auto"
          disabled
        >
          Claim <DollarIcon fill="#666666" />
        </Button>
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
    );
  }

  if (status === "claimed" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            You have claimed:
          </p>
          <Pill variant="white" className="cursor-pointer">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(Math.floor(rewardAmount || 0))}{" "}
              BONK
            </span>
          </Pill>
          <RewardInfoBox />
        </div>
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
    );
  }

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="flex items-center justify-center gap-1">
        <p className="text-[13px] font-normal leading-[17.55px] text-left">
          Your claimable reward:
        </p>
        <Pill onClick={onClick} variant="white" className="cursor-pointer">
          <span className="text-[10px] font-bold leading-[12.6px] text-left">
            0 BONK
          </span>
        </Pill>
        <RewardInfoBox />
      </div>
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
  );
};

export default ClaimButton;
