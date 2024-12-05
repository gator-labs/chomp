import { dismissMysteryBox } from "@/app/actions/mysteryBox/dismiss";
import {
  MysteryBoxResult,
  openMysteryBox,
} from "@/app/actions/mysteryBox/open";
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
import animationData from "@/public/lottie/chomp_box_bonk.json";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";

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
  const router = useRouter();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [box, setBox] = useState<MysteryBoxResult | null>(null);

  const image: MysteryBoxOpenImage = "TreasureChest";
  const message: MysteryBoxOpenMessage = "REGULAR";

  const { promiseToast, errorToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_OPENED);
    }
  }, [isOpen]);

  const openBox = async () => {
    if (!mysteryBoxId) return;

    lottieRef.current?.play();

    setIsSubmitting(true);

    try {
      const newBox = await promiseToast(openMysteryBox(mysteryBoxId), {
        loading: "Opening Mystery Box. Please wait...",
        success: "Mystery Box opened successfully! 🎉",
        error: "Failed to open the Mystery Box. Please try again later. 😔",
      });

      if (!newBox) {
        errorToast(
          "Failed to open the Mystery Box. Please try again later. 😔",
        );
        console.log("Open mystery box response was null");
        return;
      }

      setBox(newBox);
    } catch (error) {
      setBox(null);
      console.log(error);
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
    } catch (e) {
      console.log(e);
    }

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

  const prizeCount = !box
    ? 0
    : (box.creditsReceived > 0 ? 1 : 0) + (box.tokensReceived > 0 ? 1 : 0);

  if (!isOpen || !mysteryBoxId) return null;

  return (
    <>
      <MysteryBoxOverlay>
        {!box && (
          <div className="fixed z-100 flex flex-col items-center justify-center content-between h-[calc(100%_-_5.5em)] absolute">
            <div className="w-full grow-[2] flex flex-col gap-8 justify-center">
              <h1 className={`text-chomp-green-light text-2xl font-bold`}>
                You earned a mystery box!
              </h1>

              <div className="text-center text-sm">
                {buildMessage(OPEN_MESSAGES[message].subText)}
              </div>
            </div>

            <Lottie
              animationData={animationData}
              loop={false}
              lottieRef={lottieRef}
              autoplay={false}
              style={{ width: "300px", height: "300px" }}
              onClick={openBox}
              disabled={isSubmitting || !!box}
            />
            <div className="grow-[2] w-full flex flex-col gap-8">
              <Button
                variant={"primary"}
                onClick={openBox}
                disabled={isSubmitting || !!box}
              >
                Open Now
              </Button>

              <div
                className="text-sm cursor-pointer text-center text-chomp-grey-a1 underline"
                onClick={handleSkip}
              >
                Skip and miss out on your mystery box
              </div>
            </div>
          </div>
        )}

        {box && (
          <div className="fixed z-100 flex flex-col items-center justify-center content-between h-[calc(100%_-_5.5em)] absolute">
            <div className="w-full grow-[2] flex flex-col gap-8 justify-center">
              <h1 className={`text-chomp-green-light text-2xl font-bold`}>
                CHOMP, CHOMP HOORAY!
              </h1>
            </div>

            <div className="flex flex-col gap-4 grow-[2] items-center">
              <Image
                src={IMAGES[image]}
                alt="Treasure Chest"
                title="Treasure Chest"
                className="transform scale-[0.7] w-[212px]"
              />

              <div className="flex flex-col gap-6 items-center">
                <div
                  className={cn(
                    "grid gap-5",
                    prizeCount == 2 ? "grid-cols-2" : "grid-cols-1",
                  )}
                >
                  {box.creditsReceived > 0 && (
                    <MysteryBoxPrize
                      type="credits"
                      amount={box.creditsReceived}
                    />
                  )}
                  {(box.tokensReceived > 0 || prizeCount == 0) && (
                    <MysteryBoxPrize
                      type="tokens"
                      amount={box.tokensReceived}
                    />
                  )}
                </div>

                {box.creditsReceived > 0 && (
                  <div className="text-sm text-center">
                    Learn more about credits
                  </div>
                )}
              </div>

              <div className="flex items-start items-center w-full content-center justify-center gap-2 mt-[1em]">
                <span className="text-sm grow-3">Total $BONK won to date</span>
                <MysteryBoxAmount type="tokens" amount={box.totalBonkWon} />
              </div>
            </div>

            <div className="grow-[2] w-full flex flex-col gap-8">
              <Button variant={"primary"} onClick={handleGoToAnswering}>
                CHOMP on more decks →
              </Button>

              <div
                className="text-sm cursor-pointer text-center text-chomp-grey-a1"
                onClick={handleClose}
              >
                Close
              </div>
            </div>
          </div>
        )}
      </MysteryBoxOverlay>
    </>
  );
}

export default MysteryBox;
