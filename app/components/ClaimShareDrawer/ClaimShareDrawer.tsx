import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import trackEvent from "@/lib/trackEvent";
import { getClaimAllShareUrl } from "@/lib/urls";
import { DialogTitle } from "@radix-ui/react-dialog";
import { getLinkPreview } from "link-preview-js";
import Image from "next/image";
import { useEffect, useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import MysteyBox from "../MysteryBox/MysteyBox";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type ClaimShareDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  questionsAnswered: number;
  claimedAmount: number;
  transactionHash?: string;
  boxPrizeId: string;
};

const ClaimShareDrawer = ({
  isOpen,
  onClose,
  claimedAmount,
  questionsAnswered,
  transactionHash,
  boxPrizeId,
}: ClaimShareDrawerProps) => {
  const { infoToast } = useToast();
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [showMysterBox, setShowMysterBox] = useState(false);

  const claimUrl = transactionHash
    ? getClaimAllShareUrl(transactionHash.substring(0, 10))
    : "";

  const handleCopy = async () => {
    await copyTextToClipboard(claimUrl);
    infoToast("Link copied!");
  };

  useEffect(() => {
    const fetchLinkPreview = async () => {
      const linkPreview = await getLinkPreview(claimUrl);
      setOgImageUrl((linkPreview as { images: string[] }).images[0]);
    };

    if (isOpen) {
      trackEvent(TRACKING_EVENTS.SHARE_ALL_DIALOG_LOADED);
    }

    if (!!claimUrl) fetchLinkPreview();
  }, [isOpen, claimUrl]);

  if (!ogImageUrl) return;
  const FF_MYSTERY_BOX = process.env.NEXT_PUBLIC_FF_MYSTERY_BOX_CLAIM_ALL;
  return (
    <>
      {FF_MYSTERY_BOX && showMysterBox ? (
        <MysteyBox
          isOpen={showMysterBox}
          closeBoxDialog={() => {
            setShowMysterBox(false);
          }}
          boxPrizeId={boxPrizeId}
        />
      ) : (
        <Drawer
          open={isOpen}
          onOpenChange={async (open: boolean) => {
            if (!open) {
              trackEvent(TRACKING_EVENTS.SHARE_ALL_DIALOG_CLOSED);
              setShowMysterBox(true);
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
                <div
                  onClick={() => {
                    onClose();
                    setShowMysterBox(true);
                  }}
                >
                  <CloseIcon width={16} height={16} />
                </div>
              </div>
            </DialogTitle>

            <p className="text-sm mb-6">
              You just claimed {claimedAmount.toLocaleString("en-US")} BONK from{" "}
              {questionsAnswered} cards!
            </p>

            <Image
              src={ogImageUrl}
              sizes="100vw"
              className="w-full mb-6 max-w-[358px] mx-auto rounded-[8px] aspect-[1.49:1]"
              width={358}
              height={240}
              alt="og-image"
              priority
              placeholder="blur"
              quality={65}
            />

            <Button
              asChild
              onClick={() => {
                trackEvent(TRACKING_EVENTS.SHARE_ALL_X_BUTTON_CLICKED);
              }}
              className="h-[50px] mb-2 font-bold"
            >
              <a
                href={`https://x.com/intent/post?url=${claimUrl}&text=chomp%20chomp%20mfs&hashtags=chompchomp&via=chompdotgames`}
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
      )}
    </>
  );
};

export default ClaimShareDrawer;
