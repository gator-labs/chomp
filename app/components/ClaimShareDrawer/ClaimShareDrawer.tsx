"use client";

import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { useToast } from "@/app/providers/ToastProvider";
import { copyTextToClipboard } from "@/app/utils/clipboard";
import { ShareClaimAllError } from "@/lib/error";
import trackEvent from "@/lib/trackEvent";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as Sentry from "@sentry/nextjs";
import { getLinkPreview } from "link-preview-js";
import Image from "next/image";
import { useEffect, useState } from "react";

import { CloseIcon } from "../Icons/CloseIcon";
import MysteryBox from "../MysteryBox/MysteryBox";
import { Button } from "../ui/button";
import { Drawer, DrawerContent } from "../ui/drawer";

type ClaimShareDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  description: string;
  copyUrl: string;
  variant: "single" | "all";
  mysteryBoxId?: string;
};

const ClaimShareDrawer = ({
  isOpen,
  onClose,
  copyUrl,
  variant,
  description,
  mysteryBoxId,
}: ClaimShareDrawerProps) => {
  const { infoToast } = useToast();
  const [ogImageUrl, setOgImageUrl] = useState("");
  const [showMysteryBox, setShowMysteryBox] = useState(false);

  const handleCopy = async () => {
    await copyTextToClipboard(copyUrl);
    infoToast("Link copied!");
  };

  useEffect(() => {
    const fetchLinkPreview = async () => {
      try {
        const linkPreview = await getLinkPreview(copyUrl);
        setOgImageUrl((linkPreview as { images: string[] }).images[0]);
      } catch (error) {
        const shareClaimAllError = new ShareClaimAllError(
          "Failed to fetch link preview",
          { cause: error },
        );
        Sentry.captureException(shareClaimAllError);
      }
    };

    if (isOpen) {
      trackEvent(
        variant === "all"
          ? TRACKING_EVENTS.SHARE_ALL_DIALOG_LOADED
          : TRACKING_EVENTS.SHARE_DIALOG_LOADED,
      );
    }

    if (!!copyUrl) fetchLinkPreview();
  }, [isOpen, copyUrl]);
  const FF_MYSTERY_BOX = process.env.NEXT_PUBLIC_FF_MYSTERY_BOX_CLAIM_ALL;

  return (
    <>
      {FF_MYSTERY_BOX && showMysteryBox && mysteryBoxId ? (
        <MysteryBox
          isOpen={showMysteryBox}
          closeBoxDialog={() => {
            setShowMysteryBox(false);
          }}
          mysteryBoxId={mysteryBoxId}
        />
      ) : (
        <Drawer
          open={isOpen}
          onOpenChange={async (open: boolean) => {
            if (!open) {
              trackEvent(
                variant === "all"
                  ? TRACKING_EVENTS.SHARE_ALL_DIALOG_CLOSED
                  : TRACKING_EVENTS.SHARE_DIALOG_CLOSED,
              );
              setShowMysteryBox(true);
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
                    setShowMysteryBox(true);
                  }}
                >
                  <CloseIcon width={16} height={16} />
                </div>
              </div>
            </DialogTitle>

            <p className="text-sm mb-6">{description}</p>
            {ogImageUrl && (
              <>
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
                    trackEvent(
                      variant === "all"
                        ? TRACKING_EVENTS.SHARE_ALL_X_BUTTON_CLICKED
                        : TRACKING_EVENTS.SHARE_X_BUTTON_CLICKED,
                    );
                  }}
                  className="h-[50px] mb-2 font-bold"
                >
                  <a
                    href={`https://x.com/intent/post?url=${copyUrl}&text=chomp%20chomp%20mfs&hashtags=chompchomp&via=chompdotgames`}
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
              </>
            )}
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};

export default ClaimShareDrawer;
