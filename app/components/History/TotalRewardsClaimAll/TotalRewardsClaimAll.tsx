"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../Button/Button";

type TotalRewardsClaimAllProps = {
  totalRevealedRewards: number;
};

export default function TotalRewardsClaimAll({
  totalRevealedRewards,
}: TotalRewardsClaimAllProps) {
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClaimAll = async () => {
    setIsClaiming(true);
    await promiseToast(claimAllAvailable(), {
      loading: "Waiting for transaction...",
      success: "Funds are transferred!",
      error: "Issue transferring funds.",
      isChompLoader: true,
    });
    queryClient.resetQueries({ queryKey: ["questions-history"] });

    fire();
    successToast(
      "Claimed!",
      `You have successfully claimed ${numberToCurrencyFormatter.format(totalRevealedRewards)} BONK!`,
    );
    setIsClaiming(false);
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
          disabled={isClaiming}
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
