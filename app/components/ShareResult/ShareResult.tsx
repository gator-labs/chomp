"use client";

import { TRACKING_EVENTS } from "@/app/constants/tracking";
import trackEvent from "@/lib/trackEvent";
import { getClaimSingleShareUrl } from "@/lib/urls";
import { useState } from "react";

import ClaimShareDrawer from "../ClaimShareDrawer/ClaimShareDrawer";
import { ShareV2Icon } from "../Icons/ShareV2Icon";
import SingleClaimPreviewImage from "../SingleClaimPreviewImage/SingleClaimPreviewImage";
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
  options,
  selectedOptionId,
  question,
  transactionHash,
  imageUrl,
  questionId,
}: ShareResultProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const copyUrl = getClaimSingleShareUrl(
    transactionHash.substring(0, 10) + `&${questionId}`,
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
        description={`You won ${Math.round(claimedAmount).toLocaleString("en-US")} BONK for your correct answer.`}
        previewImage={
          <SingleClaimPreviewImage
            options={options}
            selectedOptionId={selectedOptionId}
            claimedAmount={claimedAmount}
            question={question}
            imageUrl={imageUrl}
          />
        }
      />
    </>
  );
};

export default ShareResult;
