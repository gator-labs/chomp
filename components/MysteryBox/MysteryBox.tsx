import { dismissMysteryBox } from "@/app/actions/mysteryBox/dismiss";
import { openMysteryBox } from "@/app/actions/mysteryBox/open";
import {
  MysteryBoxResult,
  revealMysteryBox,
} from "@/app/actions/mysteryBox/reveal";
import { Button } from "@/app/components/ui/button";
import {
  MysteryBoxOpenImage,
  MysteryBoxOpenMessage,
  OPEN_MESSAGES,
} from "@/app/constants/mysteryBox";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { useToast } from "@/app/providers/ToastProvider";
import { cn } from "@/app/utils/tailwind";
import trackEvent from "@/lib/trackEvent";
import openChestImage from "@/public/images/open-chest.png";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { Fragment, useEffect, useState } from "react";

import MysteryBoxAmount from "./MysteryBoxAmount";
import MysteryBoxOverlay from "./MysteryBoxOverlay";
import MysteryBoxPrize from "./MysteryBoxPrize";

type MysteryBoxProps = {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string | null;
};

const IMAGES: Record<MysteryBoxOpenImage, any> = {
  TreasureChest: openChestImage,
} as const;

function buildMessage(lines: string[]) {
  return lines.map((line, index) =>
    index < lines.length - 1 ? (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    ) : (
      <Fragment key={index}>{line}</Fragment>
    ),
  );
}

function MysteryBox({ isOpen, closeBoxDialog, mysteryBoxId }: MysteryBoxProps) {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [box, setBox] = useState<MysteryBoxResult | null>(null);

  const image: MysteryBoxOpenImage = "TreasureChest";
  const message: MysteryBoxOpenMessage = "REGULAR";

  const { promiseToast, successToast, errorToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_OPENED);
    }
  }, [isOpen]);

  const openBox = async () => {
    if (!mysteryBoxId) return;

    setIsSubmitting(true);

    try {
      // TODO: this process is a bit "toasty" - could probably
      // be a bit more sophisticated here and show a single toast
      // in some cases (e.g. for credits-only boxes)

      const newBox = await promiseToast(revealMysteryBox(mysteryBoxId), {
        loading: "Opening Mystery Box. Please wait...",
        success:
          "Mystery Box opened successfully! 🎉 Please wait while we send your prizes...",
        error: "Failed to open the Mystery Box. Please try again later. 😔",
      });

      if (!newBox) {
        errorToast(
          "Failed to open the Mystery Box. Please try again later. 😔",
        );
        return;
      }

      setBox(newBox);

      if (newBox) {
        openMysteryBox(mysteryBoxId)
          .then(() => {
            successToast("Your prizes are on the way!");
          })
          .catch(() => {
            errorToast("Failed to send prizes");
          });
      }
    } catch {
      setBox(null);
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleSkip = async () => {
    try {
      if (mysteryBoxId) await dismissMysteryBox(mysteryBoxId);
    } catch {}

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_SKIPPED);

    setBox(null);

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleGoToAnswering = () => {
    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();

    router.push("/application/answer");
  };

  const bonkReceived = box?.tokensReceived?.[bonkAddress] ?? 0;

  const prizeCount = !box
    ? 0
    : (box.creditsReceived > 0 ? 1 : 0) + (bonkReceived > 0 ? 1 : 0);

  if (!isOpen || !mysteryBoxId) return null;

  return (
    <>
      <MysteryBoxOverlay>
        {!box && (
          <div className="z-100 flex flex-col items-center m-auto justify-between h-full absolute pt-10 pb-10">
            <h1 className="text-chomp-green-light text-2xl font-bold">
              You earned a mystery box!
            </h1>

            <div className="text-center text-sm">
              {buildMessage(OPEN_MESSAGES[message].subText)}
            </div>

            <div className="py-9">
              <Image
                src={IMAGES[image]}
                alt="Treasure Chest"
                title="Treasure Chest"
                className="cursor-pointer w-[182px] h-[182px]"
                onClick={openBox}
              />
            </div>

            <div className="w-full">
              <Button
                variant={"primary"}
                onClick={openBox}
                disabled={isSubmitting}
              >
                Open Now
              </Button>
            </div>

            <div
              className="text-xs cursor-pointer text-center text-chomp-grey-a1 underline"
              onClick={handleSkip}
            >
              Skip and miss out on your mystery box
            </div>
          </div>
        )}

        {box && (
          <div className="z-100 flex flex-col items-center m-auto justify-between h-full absolute pt-10 pb-10">
            <h1 className="text-chomp-green-light text-2xl font-bold">
              CHOMP, CHOMP HOORAY!
            </h1>

            <Image
              src={IMAGES[image]}
              alt="Treasure Chest"
              title="Treasure Chest"
              className="transform h-[120px] w-[120px] m-4"
            />

            <div
              className={cn(
                "grid gap-5",
                prizeCount == 2 ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {box.creditsReceived > 0 && (
                <MysteryBoxPrize type="credits" amount={box.creditsReceived} />
              )}
              {(bonkReceived > 0 || prizeCount == 0) && (
                <MysteryBoxPrize type="tokens" amount={bonkReceived} />
              )}
            </div>

            {box.creditsReceived > 0 && (
              <div className="text-sm text-center">
                Learn more about credits
              </div>
            )}

            <div className="flex items-center w-full content-center justify-center gap-2 my-2">
              <span className="text-xs grow-3">Total $BONK won to date</span>
              <MysteryBoxAmount type="tokens" amount={box.totalBonkWon} />
            </div>

            <div className="w-full">
              <Button variant={"primary"} onClick={handleGoToAnswering}>
                CHOMP on more decks →
              </Button>
            </div>

            <div
              className="text-sm cursor-pointer text-center text-chomp-grey-a1"
              onClick={handleClose}
            >
              Close
            </div>
          </div>
        )}
      </MysteryBoxOverlay>
    </>
  );
}

export default MysteryBox;
