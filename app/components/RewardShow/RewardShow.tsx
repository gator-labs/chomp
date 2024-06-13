"use client";
import { claimQuestions } from "@/app/actions/claim";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useState } from "react";
import BulkIcon from "../Icons/BulkIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import Trophy from "../Icons/Trophy";
import RewardInfoBox from "../InfoBoxes/RevealPage/RewardInfoBox";
import Pill from "../Pill/Pill";

interface RewardShowProps {
  rewardAmount: number;
  questionIds: number[];
  status: "claimable" | "claimed";
}

const RewardShow = ({ rewardAmount, questionIds, status }: RewardShowProps) => {
  const { fire } = useConfetti();
  const { successToast, errorToast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);

  const onClaim = async () => {
    try {
      if (isClaiming) return;

      setIsClaiming(true);
      await claimQuestions(questionIds);
      fire();
      successToast("Claimed!", "You have successfully claimed!");
    } catch (error) {
      errorToast("Error while claiming question");
    } finally {
      setIsClaiming(false);
    }
  };

  if (rewardAmount > 0) {
    return (
      <div className="flex bg-[#333333] p-4 rounded-lg justify-between">
        <div className="flex flex-col gap-4 w-max justify-between">
          <span className="text-xl font-bold leading-[27px] text-left">
            Congrats, you won!
          </span>
          <div className="h-[1px] w-full bg-[#666666]" />
          <div className="flex items-center gap-1 justify-between">
            <p className="text-[13px] font-normal leading-[17.55px] text-left">
              Claim reward:
            </p>
            <Pill
              onClick={async () => status === "claimable" && onClaim()}
              variant="white"
              className="cursor-pointer"
            >
              <p className="text-[10px] font-bold leading-[12.6px] text-center ">
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
    <div className="p-4 flex bg-[#333333] rounded-md justify-between">
      <div className="flex flex-col gap-4 w-max justify-between">
        <span className="text-xl font-bold leading-[27px] text-left">
          Better luck next time!
        </span>
        <div className="h-[1px] w-full bg-[#666666]" />
        <div className="flex items-center gap-1 justify-start">
          <p className="text-[13px] font-normal leading-[17.55px] text-left">
            Claim reward:
          </p>
          <Pill variant="white" className="cursor-pointer">
            <p className="text-[10px] font-bold leading-[12.6px] text-center ">
              0 BONK
            </p>
          </Pill>
          <InfoIcon height={24} width={24} className="ml-1" />
        </div>
      </div>
      <BulkIcon width={74} height={74} />
    </div>
  );
};

export default RewardShow;
