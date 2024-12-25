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
import revalidateApplication from "@/lib/actions";
import trackEvent from "@/lib/trackEvent";
import animationDataRegular from "@/public/lottie/chomp_box_bonk.json";
import animationDataCredits from "@/public/lottie/chomp_box_credits.json";
import animationDataSanta from "@/public/lottie/santa_chomp_box_bonk.json";
import { EMysteryBoxType, MysteryBoxProps } from "@/types/mysteryBox";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import { useRouter } from "next-nprogress-bar";
import { Fragment, useEffect, useRef, useState } from "react";

import CreditsDrawer from "../CreditsDrawer";
import MysteryBoxOverlay from "./MysteryBoxOverlay";

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
  skipAction,
  boxType = EMysteryBoxType.Regular,
}: MysteryBoxProps) {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const router = useRouter();
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<MysteryBoxStatus>("Idle");
  const [box, setBox] = useState<MysteryBoxResult | null>(null);

  const [isCreditsDrawerOpen, setIsCreditsDrawerOpen] =
    useState<boolean>(false);

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
          success: "Mystery Box opened successfully! ",
          error: "Failed to open the Mystery Box. Please try again later. 😔",
        },
      );

      setStatus("Opening");

      setTimeout(() => {
        const bonkReceived = newBox?.tokensReceived?.[bonkAddress] ?? 0;
        const creditsReceived = newBox?.creditsReceived ?? 0;

        if (creditsReceived > 0 || bonkReceived > 0) lottieRef.current?.play();
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

    if (closeBoxDialog) {
      closeBoxDialog();
    }
    revalidateApplication();
  };

  const handleSkip = async () => {
    if (isSubmitting) return;

    if (mysteryBoxId && skipAction == "Dismiss")
      await dismissMysteryBox(mysteryBoxId);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_SKIPPED);

    setBox(null);

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleGoToAnswering = () => {
    if (isSubmitting) return;

    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();

    revalidateApplication();
    router.push("/application/answer");
  };

  const handleGoToViewCredits = () => {
    if (isSubmitting) return;

    setBox(null);

    trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) closeBoxDialog();

    router.push("/application");
  };

  const bonkReceived = box?.tokensReceived?.[bonkAddress] ?? 0;
  const creditsReceived = box?.creditsReceived ?? 0;

  if (!isOpen || !mysteryBoxId) return null;

  const getTitle = (status: MysteryBoxStatus) => {
    if (status === "Idle" || status === "Opening")
      return "You earned a mystery box!";
    if (boxType === EMysteryBoxType.Tutorial) {
      return `You won ${creditsReceived.toLocaleString("en-US")} Credits!`;
    }

    if (bonkReceived > 0 && creditsReceived > 0) {
      return (
        <>
          You won {creditsReceived.toLocaleString("en-US")} credits
          <br />
          and {bonkReceived.toLocaleString("en-US")} $BONK!
        </>
      );
    } else if (creditsReceived > 0) {
      return (
        <>
          You won {creditsReceived.toLocaleString("en-US")} credits!
          <br />
          No $BONK in this box ...
        </>
      );
    } else if (bonkReceived > 0) {
      return (
        <>
          You won {bonkReceived.toLocaleString("en-US")} $BONK!
          <br />
          No credits in this box ...
        </>
      );
    } else {
      return (
        <>
          No $BONK in this box ...
          <br /> No credits in this box ...
        </>
      );
    }
  };
  return (
    <>
      <MysteryBoxOverlay>
        <div className="flex flex-col items-center justify-between content-between absolute py-[90px] w-full max-w-[326px] h-full">
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
                "text-chomp-green-light text-2xl font-bold transition-all duration-150 text-center",
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

          <div className="flex flex-1 w-full  my-4 relative transition-all duration-75 justify-end items-center flex-col">
            <Lottie
              animationData={
                boxType === EMysteryBoxType.Chompmas
                  ? animationDataSanta
                  : creditsReceived > 0
                    ? animationDataCredits
                    : animationDataRegular
              }
              loop={false}
              lottieRef={lottieRef}
              autoplay={false}
              style={{
                transformOrigin: "5% top",
                transition: "all 0.5s ease",
                scale:
                  status === "Opening"
                    ? "1.5"
                    : status === "Closing"
                      ? "0.8"
                      : "1",
                zIndex: 999,
                transform: `translateY(-70%) translateX(-43%)`,
              }}
              className={cn(
                "absolute top-[50%] left-1/2 w-[250px] md:w-[280px] lg:w-[300px] 2xl:w-[320px] h-[250px] md:h-[280px] lg:h-[300px] 2xl:h-[320px]",
                {
                  "top-[35%]": status === "Closing",
                  "cursor-pointer": !isSubmitting && box && status === "Idle",
                  "opacity-0":
                    status == "Closing" &&
                    creditsReceived == 0 &&
                    bonkReceived == 0,
                },
              )}
              onClick={() => !isSubmitting && status === "Idle" && openBox()}
            />

            <div className="flex flex-col gap-4">
              {boxType !== EMysteryBoxType.Tutorial && (
                <div
                  className={cn(
                    "text-xs flex items-center transition-all duration-150 opacity-0",
                    {
                      "opacity-100": status === "Closing",
                    },
                  )}
                >
                  <p>Total $BONK won to date</p>
                  <div className="bg-chomp-orange-dark rounded-full py-2 px-4 w-fit ml-2">
                    {box?.totalBonkWon.toLocaleString("en-US")} BONK
                  </div>
                </div>
              )}

              <div
                className={cn(
                  "text-xs flex  items-center transition-all duration-150 opacity-0",
                  {
                    "opacity-100": status === "Closing",
                  },
                )}
              >
                <p>Total credits won to date</p>
                <div className="bg-chomp-blue-dark rounded-full py-2 px-4 w-fit ml-2 text-black">
                  {box?.totalCreditsWon.toLocaleString("en-US")} credits
                </div>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "w-full flex flex-col gap-8 transition-all duration-150",
              {
                "opacity-0": status === "Opening",
              },
            )}
          >
            {status == "Closing" && (
              <div
                className="text-sm underline text-center cursor-pointer text-chomp-grey-a1 "
                onClick={() => setIsCreditsDrawerOpen(true)}
              >
                Learn more about credits
              </div>
            )}

            <div className="flex flex-col gap-2">
              {status == "Closing" && (
                <Button
                  variant={"primary"}
                  disabled={isSubmitting}
                  onClick={handleGoToViewCredits}
                >
                  View credits
                </Button>
              )}

              {status == "Idle" && (
                <Button
                  variant={"primary"}
                  onClick={openBox}
                  disabled={isSubmitting}
                >
                  {"Open Now"}
                </Button>
              )}

              {status == "Closing" && (
                <Button
                  variant={"outline"}
                  onClick={handleGoToAnswering}
                  disabled={isSubmitting}
                >
                  {"Answer more decks →"}
                </Button>
              )}
            </div>

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
        <CreditsDrawer
          isOpen={isCreditsDrawerOpen}
          onClose={() => setIsCreditsDrawerOpen(false)}
        />
      </MysteryBoxOverlay>
    </>
  );
}

export default MysteryBox;
