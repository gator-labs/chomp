"use client";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import classNames from "classnames";
import { Button } from "../Button/Button";
import { DollarIcon } from "../Icons/DollarIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import Pill from "../Pill/Pill";

interface ClaimButtonProps {
  status: "claimable" | "claimed" | "unclaimable";
  onClick?: () => void;
  className?: string;
  rewardAmount?: number;
}

const ClaimButton = ({
  status,
  onClick,
  className,
  rewardAmount,
}: ClaimButtonProps) => {
  if (status === "claimable" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </span>
          </Pill>
          <InfoIcon width={24} height={24} />
        </div>
        <Button
          className={classNames(
            "text-[13px] font-semibold leading-[16.38px] text-left flex items-center justify-center",
            className,
          )}
          variant="purple"
          onClick={onClick}
        >
          <span>Claim</span>
          <DollarIcon height={24} width={24} />
        </Button>
      </div>
    );
  } else if (status === "claimed" && rewardAmount !== 0) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            You have claimed:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </span>
          </Pill>
          <InfoIcon width={24} height={24} />
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
  } else {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <span className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </span>
          </Pill>
          <InfoIcon width={24} height={24} />
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
  }
};

export default ClaimButton;
