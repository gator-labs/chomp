"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useState } from "react";
import { Button } from "../../Button/Button";

type TotalRewardsClaimAllProps = {
  totalRevealedRewards: number;
};

export default function TotalRewardsClaimAll({
  totalRevealedRewards,
}: TotalRewardsClaimAllProps) {
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const [isLoading, setIsLoading] = useState(false);

  const onClaimAll = async () => {
    setIsLoading(true);
    await promiseToast(claimAllAvailable(), {
      loading: "Waiting for transaction...",
      success: "Funds are transferred!",
      error: "Issue transferring funds.",
      isChompLoader: true,
    });
    fire();
    successToast(
      "Claimed!",
      `You have successfully claimed ${numberToCurrencyFormatter.format(totalRevealedRewards)} BONK!`,
    );
    setIsLoading(false);
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between gap-[10px]">
        <p className="text-xs text-white leading-[7px]">Claimable rewards</p>
        <p className="text-base text-white leading-[12px]">
          {numberToCurrencyFormatter.format(totalRevealedRewards)} BONK
        </p>
      </div>
      {totalRevealedRewards !== 0 && (
        <Button
          onClick={onClaimAll}
          disabled={isLoading}
          variant="white"
          size="small"
          isPill
          className="!w-fit h-[29px] px-4 text-xs"
        >
          Claim all
        </Button>
      )}
    </div>
  );
}
