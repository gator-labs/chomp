import { dismissMysteryBox } from "@/app/actions/mysteryBox/dismiss";
import { openMysteryBox } from "@/app/actions/mysteryBox/open";
import {
  MysteryBoxResult,
  revealMysteryBox,
} from "@/app/actions/mysteryBox/reveal";
import { Button } from "@/app/components/ui/button";
import {
  MysteryBoxOpenMessage,
  OPEN_MESSAGES,
} from "@/app/constants/mysteryBox";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { useToast } from "@/app/providers/ToastProvider";
import { cn } from "@/app/utils/tailwind";
import trackEvent from "@/lib/trackEvent";
import animationDataRegular from "@/public/lottie/chomp_box_bonk.json";
import animationDataSanta from "@/public/lottie/santa_chomp_box_bonk.json";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRouter } from "next-nprogress-bar";
import { Fragment, useEffect, useRef, useState } from "react";

import MysteryBoxOverlay from "./MysteryBoxOverlay";

type MysteryBoxProps = {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string | null;
  isDismissed: boolean;
  skipAction: MysteryBoxSkipAction;
  isChompmasBox?: boolean;
};

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

type MysteryBoxStatus = "Idle" | "Opening" | "Closing";
type MysteryBoxSkipAction = "Dismiss" | "Close";

function MysteryBox({
  isOpen,
  closeBoxDialog,
  mysteryBoxId,
  isDismissed,
  skipAction,
  isChompmasBox,
}: MysteryBoxProps) {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const router = useRouter();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<MysteryBoxStatus>("Idle");
  const [box, setBox] = useState<MysteryBoxResult | null>(null);

  const message: MysteryBoxOpenMessage = "REGULAR";

  const { promiseToast, successToast, errorToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_OPENED);
    }
  }, [isOpen]);

  const openBox = async () => {
    if (!mysteryBoxId) return;

    if (isSubmitting || status != "Idle") return false;

    setIsSubmitting(true);

    try {
      // TODO: this process is a bit "toasty" - could probably
      // be a bit more sophisticated here and show a single toast
      // in some cases (e.g. for credits-only boxes)

      const newBox = await promiseToast(
        revealMysteryBox(mysteryBoxId, isDismissed),
        {
          loading: "Opening Mystery Box. Please wait...",
          success: "Mystery Box opened successfully! 🎉.",
          error: "Failed to open the Mystery Box. Please try again later. 😔",
        },
      );

      setStatus("Opening");

      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);

      setTimeout(
        () => {
          setStatus("Closing");
        },
        lottieRef!.current!.getDuration()! * 1000 + 500,
      );

      if (!newBox) {
        errorToast(
          "Failed to open the Mystery Box. Please try again later. 😔",
        );
        return;
      }

      setBox(newBox);

      if (newBox) {
        openMysteryBox(mysteryBoxId, isDismissed)
          .then(() => {
            successToast("Your prizes are on the way!");
          })
          .catch(() => {
            errorToast("Failed to send prizes");
          });
      }
    } catch {
      setBox(null);
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 3000);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleSkip = async () => {
    if (isSubmitting) return;

    try {
      if (mysteryBoxId && skipAction == "Dismiss")
        await dismissMysteryBox(mysteryBoxId);
    } catch {}

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_SKIPPED);

    setBox(null);

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleGoToAnswering = () => {
    if (isSubmitting) return;

    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();

    router.push("/application/answer");
  };

  const bonkReceived = box?.tokensReceived?.[bonkAddress] ?? 0;

  if (!isOpen || !mysteryBoxId) return null;

  const getTitle = (status: MysteryBoxStatus) => {
    if (status === "Idle" || status === "Opening")
      return "You earned a mystery box!";

    return `You won ${bonkReceived.toLocaleString("en-US")} BONK!`;
  };
  return (
    <>
      <MysteryBoxOverlay>
        <div className="flex flex-col items-center justify-between content-between absolute pt-[88px] pb-[115px] w-full max-w-[326px] h-full">
          <div
            className={cn(
              "w-full flex flex-col gap-8 transition-all duration-150 items-center",
              {
                "opacity-0": status === "Opening",
              },
            )}
          >
            <h1
              className={cn(
                "text-chomp-green-light text-2xl font-bold transition-all duration-150",
                {
                  "opacity-0": status === "Opening",
                },
              )}
            >
              {getTitle(status)}
            </h1>

            {status !== "Closing" && (
              <div
                className={cn(
                  "text-center text-sm transition-all duration-150 opacity-0",
                  {
                    "opacity-100": status === "Idle",
                  },
                )}
              >
                {buildMessage(OPEN_MESSAGES[message].subText)}
              </div>
            )}
          </div>

          <div className="flex flex-1 w-full my-10 relative transition-all duration-75 justify-end items-center flex-col">
            <Lottie
              animationData={
                isChompmasBox ? animationDataSanta : animationDataRegular
              }
              loop={false}
              lottieRef={lottieRef}
              autoplay={false}
              style={{
                width: "280px",
                height: "280px",
                transformOrigin: "5% top",
                transition: "all 0.5s ease",
                scale: status === "Opening" ? "1.5" : "1.2",
                zIndex: 999,
                transform: `translateY(-75%) translateX(-43%)`,
              }}
              className={cn("absolute top-1/2 left-1/2", {
                "cursor-pointer": !isSubmitting && box && status === "Idle",
              })}
              onClick={() =>
                !isSubmitting && box && status === "Idle" && openBox()
              }
            />

            <div
              className={cn(
                "text-xs flex gap-1 items-center transition-all duration-150 opacity-0",
                {
                  "opacity-100": status === "Closing",
                },
              )}
            >
              <p>Total $BONK won to date</p>
              <div className="bg-chomp-orange-dark rounded-[56px] py-2 px-4 w-fit">
                {box?.totalBonkWon.toLocaleString("en-US")} BONK
              </div>
            </div>
          </div>

          <div
            className={cn(
              "w-full flex flex-col gap-10 transition-all duration-150",
              {
                "opacity-0": status === "Opening",
              },
            )}
          >
            <Button
              variant={"primary"}
              onClick={() =>
                status === "Closing" ? handleGoToAnswering() : openBox()
              }
              disabled={isSubmitting}
            >
              {status === "Closing" ? "CHOMP on more decks →" : "Open Now"}
            </Button>

            <div
              className="text-sm cursor-pointer text-center text-chomp-grey-a1 underline"
              onClick={status === "Closing" ? handleClose : handleSkip}
            >
              {status === "Closing"
                ? "Close"
                : "Skip and miss out on your mystery box"}
            </div>
          </div>
        </div>
      </MysteryBoxOverlay>
    </>
  );
}

export default MysteryBox;
