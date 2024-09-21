"use client";
import { claimAllAvailable } from "@/app/actions/claim";
import { TwitterIcon } from "@/app/components/Icons/TwitterIcon";
import {
  MIX_PANEL_EVENTS,
  MIX_PANEL_METADATA,
  REVEAL_TYPE,
} from "@/app/constants/mixpanel";
import { useClaiming } from "@/app/providers/ClaimingProvider";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import sendToMixpanel from "@/lib/mixpanel";
import { getOgShareClaimAllPath } from "@/lib/urls";
import { Question } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine } from "lucide-react";
import Image from "next/image";
import { startTransition, useOptimistic, useState } from "react";
import { Button } from "../../Button/Button";
import { CloseIcon } from "../../Icons/CloseIcon";
import { Button as SdButton } from "../../ui/button";
import { Drawer, DrawerContent } from "../../ui/drawer";

type TotalRewardsClaimAllProps = {
  totalClaimableRewards?: {
    questions: (Question | null)[];
    totalClaimableRewards: number;
  };
};

type ClaimQuestionData = {
  questionIds: number[];
  claimedAmount: number;
  burnTx: string | null;
};

export default function TotalRewardsClaimAll({
  totalClaimableRewards,
}: TotalRewardsClaimAllProps) {
  const [optimisticAmount, claimOptimistic] = useOptimistic(
    totalClaimableRewards?.totalClaimableRewards || 0,
    (_, optimisticValue: number) => optimisticValue,
  );
  const { promiseToast, successToast } = useToast();
  const { fire } = useConfetti();
  const queryClient = useQueryClient();
  const { isClaiming, setIsClaiming } = useClaiming();
  const [openClaimShareModal, setOpenClaimShareModal] = useState(false);
  const [claimRes, setClaimRes] = useState<ClaimQuestionData>();

  const shortenBurnTx = claimRes?.burnTx?.substring(0, 10);
  const imgUrl = shortenBurnTx
    ? `${process.env.NEXT_PUBLIC_API_URL}${getOgShareClaimAllPath(shortenBurnTx)}`
    : null;
  const metadataUrl = shortenBurnTx
    ? `${process.env.NEXT_PUBLIC_APP_URL}/a/${shortenBurnTx}`
    : null;

  const onClaimAll = async () => {
    try {
      setIsClaiming(true);

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_STARTED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [MIX_PANEL_METADATA.QUESTION_TEXT]:
          totalClaimableRewards?.questions.map((q) => q?.question),
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });

      const res = await promiseToast(claimAllAvailable(), {
        loading: "Claim in progress. Please wait...",
        success: "Funds are transferred!",
        error: "Issue transferring funds.",
      });
      setClaimRes({
        questionIds: res?.questionIds ?? [],
        claimedAmount: res?.claimedAmount ?? 0,
        burnTx: res?.burnTx ?? null,
      });

      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_SUCCEEDED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: res?.questionIds,
        [MIX_PANEL_METADATA.CLAIMED_AMOUNT]: res?.claimedAmount,
        [MIX_PANEL_METADATA.TRANSACTION_SIGNATURE]: res?.transactionSignature,
        [MIX_PANEL_METADATA.QUESTION_TEXT]: res?.questions,
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });

      startTransition(() => {
        claimOptimistic(0);
      });
      queryClient.resetQueries({ queryKey: ["questions-history"] });

      fire();
      successToast(
        "Claimed!",
        `You have successfully claimed ${numberToCurrencyFormatter.format(totalClaimableRewards?.totalClaimableRewards || 0)} BONK!`,
      );
      setIsClaiming(false);
      setOpenClaimShareModal(true);
    } catch (error) {
      sendToMixpanel(MIX_PANEL_EVENTS.CLAIM_FAILED, {
        [MIX_PANEL_METADATA.QUESTION_ID]: totalClaimableRewards?.questions.map(
          (q) => q?.id,
        ),
        [MIX_PANEL_METADATA.QUESTION_TEXT]:
          totalClaimableRewards?.questions.map((q) => q?.question),
        [MIX_PANEL_METADATA.REVEAL_TYPE]: REVEAL_TYPE.ALL,
      });
      setOpenClaimShareModal(false);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleTwitterShare = () => {
    if (!metadataUrl) return;

    const wonAmount = claimRes?.claimedAmount || 0;
    const numCards = claimRes?.questionIds.length || 0;

    const cardText = numCards === 1 ? "card" : "cards";

    let tweetText = "";
    if (wonAmount > 0) {
      tweetText = `I just won ${wonAmount.toLocaleString("en-US")} $BONK for chomping ${numCards} ${cardText}.`;
    } else {
      tweetText = `I suck, do you?`;
    }

    const url = encodeURIComponent(metadataUrl);
    const text = encodeURIComponent(tweetText);
    const hashtags = "chompchomp";
    const via = "chompdotgames";
    const twitterUrl = `https://x.com/intent/post?url=${url}&text=${text}&hashtags=${hashtags}&via=${via}`;

    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="flex justify-between">
      <div className="flex flex-col justify-between gap-[10px]">
        <p className="text-xs text-white ">Claimable rewards</p>
        <p className="text-base text-white ">
          {numberToCurrencyFormatter.format(optimisticAmount)} BONK
        </p>
      </div>
      {optimisticAmount !== 0 && (
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
      <Drawer
        open={openClaimShareModal}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setOpenClaimShareModal(false);
          }
        }}
      >
        <DrawerContent>
          <SdButton
            variant="ghost"
            onClick={() => {
              setOpenClaimShareModal(false);
            }}
            className="absolute top-5 right-6 border-none w-max !p-0 z-50"
          >
            <CloseIcon width={16} height={16} />
          </SdButton>
          <div className="flex flex-col gap-6 pt-6 px-6 pb-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-row w-full items-center justify-between">
                <h3 className="text-secondary text-[16px]">
                  Share your result!
                </h3>
              </div>
              <p className="text-[14px]">
                You just claimed ${claimRes?.claimedAmount} BONK from{" "}
                {claimRes?.questionIds.length} cards!
              </p>
            </div>

            <div className="flex justify-center">
              {imgUrl && (
                <Image
                  src={imgUrl}
                  alt="Claim All image"
                  className="p-4 w-[100%] h-auto"
                />
              )}
            </div>

            <div className="flex flex-row px-5 justify-between">
              <SdButton
                variant="ghost"
                className="bg-purple-200 text-gray-900 rounded-full w-[40px] h-[40px]"
              >
                <ArrowDownToLine />
              </SdButton>
              <SdButton
                variant="ghost"
                className="bg-purple-200 text-gray-900 rounded-full w-[40px] h-[40px]"
                onClick={handleTwitterShare}
              >
                <TwitterIcon />
              </SdButton>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
