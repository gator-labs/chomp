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
  if (status === "claimable") {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <p className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </p>
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
  } else if (status === "claimed") {
    return (
      <div className="flex flex-col gap-4 items-center justify-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Your claimable reward:
          </p>
          <Pill onClick={onClick} variant="white" className="cursor-pointer">
            <p className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </p>
          </Pill>
          <InfoIcon width={24} height={24} />
        </div>
        <Button
          disabled
          className={classNames(
            "!bg-btn-text-disabled !text-[#666666] text-[13px] font-semibold leading-[16.38px] text-left flex items-center justify-center",
            className,
          )}
        >
          <span>Claimed</span>
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
            <p className="text-[10px] font-bold leading-[12.6px] text-left">
              {numberToCurrencyFormatter.format(rewardAmount || 0)} BONK
            </p>
          </Pill>
          <InfoIcon width={24} height={24} />
        </div>
        <Button
          className={classNames(
            "grayscale-[100%] !bg-pink !text-btn-text-pink text-[13px] font-semibold leading-[16.38px] text-left",
            className,
          )}
          disabled
        >
          Unclaimable
        </Button>
      </div>
    );
  }
};

export default ClaimButton;
