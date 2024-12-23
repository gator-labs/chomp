"use client";

import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { numberToCurrencyFormatter } from "@/app/utils/currency";
import trackEvent from "@/lib/trackEvent";
import { getClaimSingleShareUrl } from "@/lib/urls";
import { useState } from "react";

import ClaimShareDrawer from "../ClaimShareDrawer/ClaimShareDrawer";
import { ShareV2Icon } from "../Icons/ShareV2Icon";
import { Button } from "../ui/button";

type ShareResultProps = {
  claimedAmount: number;
  transactionHash: string;
  options: {
    id: number;
    option: string;
  }[];
  selectedOptionId: number;
  question: string;
  imageUrl?: string;
  questionId: number;
};

const ShareResult = ({
  claimedAmount,
  transactionHash,
  questionId,
}: ShareResultProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyUrl = getClaimSingleShareUrl(
    transactionHash.substring(0, 10) + `_${questionId}`,
  );

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          trackEvent(TRACKING_EVENTS.SHARE_BUTTON_CLICKED);
          setIsOpen(true);
        }}
      >
        Share
        <ShareV2Icon />
      </Button>

      <ClaimShareDrawer
        variant="single"
        isOpen={isOpen}
        copyUrl={copyUrl}
        onClose={() => setIsOpen(false)}
        description={`You won ${numberToCurrencyFormatter.format(Math.round(claimedAmount || 0))} BONK for your correct answer.`}
      />
    </>
  );
};

export default ShareResult;
