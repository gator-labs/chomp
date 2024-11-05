import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import trackEvent from "@/lib/trackEvent";
import { getClaimAllShareUrl } from "@/lib/urls";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useEffect } from "react";

import ClaimPreviewImage from "../ClaimPreviewImage/ClaimPreviewImage";
import { CloseIcon } from "../Icons/CloseIcon";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type ClaimShareDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  questionsAnswered: number;
  correctAnswers: number;
  profileImg: string;
  claimedAmount: number;
  transactionHash?: string;
};

const ClaimShareDrawer = ({
  isOpen,
  onClose,
  claimedAmount,
  correctAnswers,
  profileImg,
  questionsAnswered,
  transactionHash,
}: ClaimShareDrawerProps) => {
  const { infoToast } = useToast();

  const claimUrl = transactionHash
    ? getClaimAllShareUrl(transactionHash.substring(0, 10))
    : "";

  const handleCopy = async () => {
    await copyTextToClipboard(claimUrl);
    infoToast("Link copied!");
  };

  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.SHARE_ALL_DIALOG_LOADED);
    }
  }, [isOpen]);

  return (
    <Drawer
      open={isOpen}
      onOpenChange={async (open: boolean) => {
        if (!open) {
          trackEvent(TRACKING_EVENTS.SHARE_ALL_DIALOG_CLOSED);
          onClose();
        }
      }}
    >
      <DrawerContent className="p-6 px-4 flex flex-col">
        <DialogTitle>
          <div className="flex justify-between items-center mb-6">
            <p className="text-base text-secondary font-bold">
              Claim succeeded!
            </p>
            <div onClick={onClose}>
              <CloseIcon width={16} height={16} />
            </div>
          </div>
        </DialogTitle>

        <p className="text-sm mb-6">
          You just claimed {claimedAmount.toLocaleString("en-US")} BONK from{" "}
          {questionsAnswered} cards!
        </p>

        <ClaimPreviewImage
          claimedAmount={claimedAmount}
          correctAnswers={correctAnswers}
          profileImg={profileImg}
          questionsAnswered={questionsAnswered}
        />

        <Button
          asChild
          onClick={() => {
            trackEvent(TRACKING_EVENTS.SHARE_ALL_X_BUTTON_CLICKED);
          }}
          className="h-[50px] mb-2 font-bold"
        >
          <a
            href={`https://x.com/intent/tweet?text=${claimUrl}&hashtags=chompchomp&via=chompdotgames`}
            target="_blank"
            rel="noreferrer"
          >
            Share on X
          </a>
        </Button>
        <Button
          variant="outline"
          onClick={handleCopy}
          className="h-[50px] font-bold"
        >
          Copy Link
        </Button>
      </DrawerContent>
    </Drawer>
  );
};

export default ClaimShareDrawer;
