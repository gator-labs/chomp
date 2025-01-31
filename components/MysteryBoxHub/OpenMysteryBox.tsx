import { Button } from "@/app/components/ui/button";
import {
  MysteryBoxOpenMessage,
  OPEN_MESSAGES,
} from "@/app/constants/mysteryBox";
import {
  MysteryBoxStatus,
  buildMessage,
} from "@/components/MysteryBox/MysteryBox";
import { cn } from "@/lib/utils";
import animationDataRegular from "@/public/lottie/chomp_box_bonk.json";
import animationDataSanta from "@/public/lottie/santa_chomp_box_bonk.json";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import { LottieRefCurrentProps } from "lottie-react";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";

import MysteryBoxOverlay from "../MysteryBox/MysteryBoxOverlay";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export interface OpenMysteryBoxProps {
  isOpen: boolean;
  closeBoxDialog?: () => void;
  boxType: EMysteryBoxCategory;
  isFetching: boolean;
}

function OpenMysteryBox({
  isOpen,
  closeBoxDialog,
  boxType = EMysteryBoxCategory.Validation,
  isFetching,
}: OpenMysteryBoxProps) {
  const [status, setStatus] = useState<MysteryBoxStatus>("Idle");
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const message: MysteryBoxOpenMessage = "REGULAR";

  const bonkReceived = 0;
  const creditsReceived = 0;

  // useEffect(() => {
  //     if (isOpen) {
  //         setTimeout(() => {
  //             lottieRef.current?.play();
  //         }, 1000
  //         );
  //         // trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_OPENED);
  //     }
  // }, [isOpen]);

  if (!isOpen) return null;

  const getTitle = (status: MysteryBoxStatus) => {
    if (status === "Idle" || status === "Opening")
      return "You earned a mystery box!";

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

  const handleClose = () => {
    // if (isSubmitting) return;

    // setBox(null);

    // trackEvent(TRACKING_EVENTS.MYSTERY_BOX_DIALOG_CLOSED);

    if (closeBoxDialog) {
      closeBoxDialog();
    }
    // revalidateApplication();
  };

  return (
    <MysteryBoxOverlay>
      <div className="flex flex-col items-center justify-between content-between absolute py-[70px] w-full max-w-[326px] h-full">
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
              boxType === EMysteryBoxCategory.Validation
                ? animationDataSanta
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
                "top-[40%]": status === "Closing",
                // "cursor-pointer": !isSubmitting && box && status === "Idle",
                "opacity-0":
                  status == "Closing" &&
                  creditsReceived == 0 &&
                  bonkReceived == 0,
              },
            )}
            // onClick={() => !isSubmitting && status === "Idle" && openBox()}
          />
        </div>

        {status == "Idle" && (
          <Button
            variant={"primary"}
            isLoading={isFetching}

            // onClick={openBox}
            // disabled={isSubmitting}
          >
            {"Open Now"}
          </Button>
        )}

        {status == "Closing" && (
          <Button
            variant={"outline"}
            // onClick={handleGoToAnswering}
            // disabled={isSubmitting}
          >
            {"Answer more decks →"}
          </Button>
        )}

        <div
          className="text-sm cursor-pointer text-center text-chomp-grey-a1 underline pt-8"
          onClick={handleClose}
        >
          Close
        </div>
      </div>
    </MysteryBoxOverlay>
  );
}

export default OpenMysteryBox;
