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
import animationData from "@/public/lottie/chomp_box_bonk.json";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRouter } from "next-nprogress-bar";
import { Fragment, useEffect, useRef, useState } from "react";

import MysteryBoxOverlay from "./MysteryBoxOverlay";

type MysteryBoxProps = {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string | null;
  isDismissed: boolean;
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

function MysteryBox({
  isOpen,
  closeBoxDialog,
  mysteryBoxId,
  isDismissed,
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
    setIsSubmitting(true);

    try {
      // TODO: this process is a bit "toasty" - could probably
      // be a bit more sophisticated here and show a single toast
      // in some cases (e.g. for credits-only boxes)

      const newBox = await promiseToast(
        revealMysteryBox(mysteryBoxId, isDismissed),
        {
          loading: "Opening Mystery Box. Please wait...",
          success:
            "Mystery Box opened successfully! 🎉 Please wait while we send your prizes...",
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
      setIsSubmitting(false);
    }
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
              animationData={animationData}
              loop={false}
              lottieRef={lottieRef}
              autoplay={false}
              style={{
                width: "280px",
                height: "280px",
                transformOrigin: "5% top",
                transition: "all 0.5s ease",
                scale:
                  status === "Opening"
                    ? "1.5"
                    : status === "Closing"
                      ? "0.6"
                      : "1",
                zIndex: 999,
                transform: `translateY(${status === "Closing" ? -118 : -70}%) translateX(${status === "Closing" ? -48 : -43}%)`,
              }}
              className={cn("absolute top-1/2 left-1/2", {
                "cursor-pointer": !isSubmitting || !box,
              })}
              onClick={openBox}
              disabled={isSubmitting || !!box}
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
              onClick={status === "Closing" ? handleGoToAnswering : openBox}
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
