"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import { ONE_SECOND_IN_MILLISECONDS } from "@/app/utils/dateUtils";

type TotalRewardsClaimAllProps = {
  totalRevealedRewards: number;
  onRefresh: () => void;
};

export default function TotalRewardsClaimAll({
  totalRevealedRewards,
  onRefresh,
}: TotalRewardsClaimAllProps) {
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();

  const onClaimAll = async () => {
    try {
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
      setTimeout(() => {
        onRefresh();
      }, ONE_SECOND_IN_MILLISECONDS * 4);
    } catch (error) {
      return;
    }
  };

  return (
    <div className="flex justify-between px-4 mt-4">
      <div className="flex flex-col justify-between">
        <div className="text-sm text-white font-sora">
          Total Revealed Rewards
        </div>
        <div className="text-base text-white font-sora">
          {numberToCurrencyFormatter.format(totalRevealedRewards)} BONK
        </div>
      </div>
      {/**
       * Commented out the claim all button
       * We'll probably need this in the future
       */}
      {/* {totalRevealedRewards !== 0 && (
        <Button
          onClick={onClaimAll}
          variant="white"
          size="small"
          isPill
          className="basis-24"
        >
          Claim all
        </Button>
      )} */}
    </div>
  );
}
