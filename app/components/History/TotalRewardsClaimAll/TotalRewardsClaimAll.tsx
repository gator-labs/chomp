"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import * as Sentry from "@sentry/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic } from "react";
import { Button } from "../../Button/Button";

type TotalRewardsClaimAllProps = {
  totalRevealedRewards: number;
};

export default function TotalRewardsClaimAll({
  totalRevealedRewards,
}: TotalRewardsClaimAllProps) {
  const [optimisticAmount, claimOptimistic] = useOptimistic(
    totalRevealedRewards,
    (_, optimisticValue: number) => optimisticValue,
  );
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();

  const onClaimAll = async () => {
    try {
      setIsClaiming(true);
      await promiseToast(
        claimAllAvailable(),
        {
          loading: "Claim in progress. Please wait...",
          success: "Funds are transferred!",
          error: "Issue transferring funds.",
          isChompLoader: true,
        },
        { duration: Infinity },
      );
      startTransition(() => {
        claimOptimistic(0);
      });
      queryClient.resetQueries({ queryKey: ["questions-history"] });

      fire();
      successToast(
        "Claimed!",
        `You have successfully claimed ${numberToCurrencyFormatter.format(totalRevealedRewards)} BONK!`,
      );
      setIsClaiming(false);
    } catch (error) {
      console.log({ error });
      Sentry.captureException(error);
      Sentry.captureMessage("Danijel test");
    }
  };

  const throwError = async () => {
    try {
      throw new Error("Error thrown from fake api");
    } catch (error) {
      console.log(error);
      Sentry.captureException(
        `User with id: 'test' is having trouble with claiming questions with next ids: []`,
        (scope) => {
          scope.setTransactionName("CLAIM ERROR");
          return scope;
        },
      );
    }
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between gap-[10px]">
        <p className="text-xs text-white leading-[7px]">Claimable rewards</p>
        <p className="text-base text-white leading-[12px]">
          {numberToCurrencyFormatter.format(optimisticAmount)} BONK
        </p>
      </div>
      <Button
        onClick={throwError}
        disabled={isClaiming}
        variant="white"
        size="small"
        isPill
        className="!w-fit h-[29px] px-4 text-xs"
      >
        Throw error
      </Button>
      <Button
        onClick={claimAllAvailable}
        disabled={isClaiming}
        variant="white"
        size="small"
        isPill
        className="!w-fit h-[29px] px-4 text-xs"
      >
        Claim all
      </Button>
    </div>
  );
}
