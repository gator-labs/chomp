"use client";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { ToastContainer, toast } from "react-toastify";
import BulkIcon from "../Icons/BulkIcon";
import { InfoIcon } from "../Icons/InfoIcon";
import Trophy from "../Icons/Trophy";

interface RewardShowProps {
  rewardAmount: number;
}

const RewardShow = ({ rewardAmount }: RewardShowProps) => {
  const { fire } = useConfetti();
  return rewardAmount > 0 ? (
    <>
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
            <div
              className="px-4 py-2 bg-white flex items-center justify-center rounded-[56px] cursor-pointer"
              onClick={() => {
                fire();
                toast.info(
                  `Reward Claimed! (${numberToCurrencyFormatter.format(rewardAmount)} BONK)`,
                );
              }}
            >
              <p className="text-[#0D0D0D] text-[10px] font-bold leading-[12.6px] text-center">
                {numberToCurrencyFormatter.format(rewardAmount)} BONK
              </p>
            </div>
            <InfoIcon height={24} width={24} className="ml-1" />
          </div>
        </div>
        <Trophy width={70} height={85} />
      </div>
      <ToastContainer position="top-center" />
    </>
  ) : (
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
          <div className="px-4 py-2 bg-white flex items-center justify-center rounded-[56px] cursor-pointer">
            <p className="text-[#0D0D0D] text-[10px] font-bold leading-[12.6px] text-center">
              0 BONK
            </p>
          </div>
          <InfoIcon height={24} width={24} className="ml-1" />
        </div>
      </div>
      <BulkIcon width={74} height={74} />
    </div>
  );
};

export default RewardShow;
