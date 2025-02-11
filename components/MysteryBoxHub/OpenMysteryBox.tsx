import { openMysteryBoxHub } from "@/app/actions/mysteryBox/openMysteryBoxHub";
import { Button } from "@/app/components/ui/button";
import {
  MysteryBoxOpenMessage,
  OPEN_MESSAGES,
} from "@/app/constants/mysteryBox";
import { useToast } from "@/app/providers/ToastProvider";
import { revalidateRewards } from "@/lib/actions";
import { cn } from "@/lib/utils";
import animationDataRegular from "@/public/lottie/chomp_box_bonk.json";
import animationDataCredits from "@/public/lottie/chomp_box_credits.json";
import animationDataNothing from "@/public/lottie/chomp_box_nothing.json";
import { EMysteryBoxCategory, MysteryBoxStatus } from "@/types/mysteryBox";
import { useQueryClient } from "@tanstack/react-query";
import { LottieRefCurrentProps } from "lottie-react";
import dynamic from "next/dynamic";
import React, { useRef, useState } from "react";

import BuildMessage from "../BuildMessage";
import MysteryBoxOverlay from "../MysteryBox/MysteryBoxOverlay";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export interface OpenMysteryBoxProps {
  isOpen: boolean;
  closeBoxDialog?: () => void;
  boxType: EMysteryBoxCategory;
  mysteryBoxIds: string[];
}

function OpenMysteryBox({
  isOpen,
  boxType,
  closeBoxDialog,
  mysteryBoxIds,
}: OpenMysteryBoxProps) {
  const [status, setStatus] = useState<MysteryBoxStatus>("Idle");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mysteryBoxReward, setMysteryBoxReward] = useState<{
    totalCreditAmount: number;
    totalBonkAmount: number;
  }>({ totalCreditAmount: 0, totalBonkAmount: 0 });
  const lottieRef = useRef<LottieRefCurrentProps | null>(null);

  const queryClient = useQueryClient();

  const { promiseToast } = useToast();
  const message: MysteryBoxOpenMessage = "REGULAR";

  if (!isOpen) return null;

  const openBox = async () => {
    if (mysteryBoxIds.length === 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await promiseToast(openMysteryBoxHub(mysteryBoxIds), {
        loading: "Opening Mystery Box. Please wait...",
        success: "Mystery Box opened successfully! ",
        error: "Failed to open the Mystery Box. Please try again later. 😔",
      });

      setStatus("Opening");

      setTimeout(() => {
        lottieRef.current?.play();
      }, 500);

      if (res) {
        setMysteryBoxReward(res);
      }

      setTimeout(
        () => {
          setStatus("Closing");
        },
        lottieRef!.current!.getDuration()! * 1000 + 500,
      );
    } catch {
      console.error("Failed to open the Mystery Box");
    } finally {
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ["mystery-boxes-history"] });
    }
  };

  const getTitle = (status: MysteryBoxStatus) => {
    if (status === "Idle" || status === "Opening")
      return "You earned a mystery box!";

    if (
      mysteryBoxReward.totalBonkAmount > 0 &&
      mysteryBoxReward.totalCreditAmount > 0
    ) {
      return (
        <>
          You won {mysteryBoxReward.totalCreditAmount.toLocaleString("en-US")}{" "}
          credits
          <br />
          and {mysteryBoxReward.totalBonkAmount.toLocaleString("en-US")} $BONK!
        </>
      );
    } else if (mysteryBoxReward.totalCreditAmount > 0) {
      return (
        <>
          You won {mysteryBoxReward.totalCreditAmount.toLocaleString("en-US")}{" "}
          credits!
          <br />
          No $BONK in this box ...
        </>
      );
    } else if (mysteryBoxReward.totalBonkAmount > 0) {
      return (
        <>
          You won {mysteryBoxReward.totalBonkAmount.toLocaleString("en-US")}{" "}
          $BONK!
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

  const getAnimation = (mysteryBoxReward: {
    totalCreditAmount: number;
    totalBonkAmount: number;
  }) => {
    return mysteryBoxReward.totalBonkAmount === 0 &&
      mysteryBoxReward.totalCreditAmount === 0
      ? animationDataNothing
      : boxType === EMysteryBoxCategory.Validation
        ? animationDataCredits
        : animationDataRegular;
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
              {BuildMessage(OPEN_MESSAGES[message].subText)}
            </div>
          )}
        </div>

        <div className="flex flex-1 w-full  my-4 relative transition-all duration-75 justify-end items-center flex-col">
          <Lottie
            animationData={getAnimation(mysteryBoxReward)}
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
                    ? "1.2"
                    : "1",
              zIndex: 999,
              transform: `translateY(-70%) translateX(-43%)`,
            }}
            className={cn(
              "absolute top-[50%] left-1/2 w-[250px] md:w-[280px] lg:w-[300px] 2xl:w-[320px] h-[250px] md:h-[280px] lg:h-[300px] 2xl:h-[320px]",
              {
                "top-[40%]": status === "Closing",
              },
            )}
            onClick={() => !isSubmitting && status === "Idle" && openBox()}
          />
        </div>

        {status == "Idle" && (
          <Button
            variant={"primary"}
            isLoading={isSubmitting}
            onClick={openBox}
            disabled={isSubmitting}
          >
            {"Open Now"}
          </Button>
        )}

        {status == "Closing" && (
          <Button
            variant={"outline"}
            onClick={() => {
              closeBoxDialog?.();
              revalidateRewards();
            }}
          >
            {"Go to Rewards"}
          </Button>
        )}

        {status === "Idle" && (
          <div
            className="text-sm cursor-pointer text-center text-chomp-grey-a1 underline pt-8"
            onClick={closeBoxDialog}
          >
            Close
          </div>
        )}
      </div>
    </MysteryBoxOverlay>
  );
}

export default OpenMysteryBox;
