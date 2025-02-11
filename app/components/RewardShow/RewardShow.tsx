"use client";

import { numberToCurrencyFormatter } from "@/app/utils/currency";

import BulkIcon from "../Icons/BulkIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import Trophy from "../Icons/Trophy";
import Pill from "../Pill/Pill";

interface RewardShowProps {
  isCreditsQuestion: boolean;
  isFirstOrderCorrect: boolean;
  isSecondOrderCorrect?: boolean;
  rewardAmount: number;
  questionIds: number[];
  status: "claimable" | "claimed";
  questions: string[];
  revealAmount: number;
  creditsRewardAmount: string | undefined;
}

const RewardShow = ({
  isFirstOrderCorrect,
  isSecondOrderCorrect,
  rewardAmount,
  creditsRewardAmount,
}: RewardShowProps) => {
  if (isFirstOrderCorrect) {
    return (
      <div className="flex bg-gray-700 p-4 rounded-lg justify-between">
        <div className="flex flex-col gap-4 w-max justify-between">
          <span className="text-xl font-bold text-left">
            {isSecondOrderCorrect !== undefined && isSecondOrderCorrect === true
              ? "Congrats, you won!"
              : "Well done!"}
          </span>
          <div className="h-[1px] w-full bg-gray-500" />
          {isSecondOrderCorrect !== undefined ? (
            <div className="flex items-center gap-1 justify-between">
              <p className="text-sm font-normal  text-left">Claim reward:</p>
              <Pill variant="white">
                <p className="text-xs font-bold text-center">
                  {numberToCurrencyFormatter.format(
                    Math.round(rewardAmount || 0),
                  )}{" "}
                  BONK
                </p>
              </Pill>
              <Pill variant="white">
                <p className="text-xs font-bold text-center">
                  {Number(creditsRewardAmount) || 0} CREDITS
                </p>
              </Pill>
            </div>
          ) : (
            <div className="flex items-center gap-1 justify-between">
              View your rewards below.
            </div>
          )}
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
