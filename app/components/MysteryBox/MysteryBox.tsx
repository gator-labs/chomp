import { openMysteryBox } from "@/app/actions/mysteryBox";
import { useToast } from "@/app/providers/ToastProvider";
import { cn } from "@/app/utils/tailwind";
import openChestImage from "@/public/images/open-chest.png";
import { useRouter } from "next-nprogress-bar";
import Image from "next/image";
import { useState } from "react";

import { Button } from "../ui/button";
import MysteryBoxAmount from "./MysteryBoxAmount";
import MysteryBoxPrize from "./MysteryBoxPrize";

type MysteryBoxProps = {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string;
};

type MysteryBoxStep = "initial" | "opened";

function MysteryBox({ isOpen, closeBoxDialog, mysteryBoxId }: MysteryBoxProps) {
  const router = useRouter();

  const [step, setStep] = useState<MysteryBoxStep>("initial");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [tokensReceived, setTokensReceived] = useState<number>(0);
  const [creditsReceived, setCreditsReceived] = useState<number>(0);
  const [totalBonkWon, setTotalBonkWon] = useState<number>(0);

  const { promiseToast } = useToast();
  const openBox = async () => {
    setIsSubmitting(true);

    try {
      const box = await promiseToast(openMysteryBox(mysteryBoxId), {
        loading: "Opening Mystery Box. Please wait...",
        success: "Mystery Box opened successfully! 🎉",
        error: "Failed to open the Mystery Box. Please try again later. 😔",
      });

      if (!box) {
        console.error("Mystery box was not opened");
        return;
      }

      setTokensReceived(box?.rewardAmount ?? 0);
      setCreditsReceived(0);
      setTotalBonkWon(box?.totalBonkWon ?? 0);
      setStep("opened");
    } catch (error) {
      console.log(error);
    }

    setIsSubmitting(false);
  };

  const handleClose = () => {
    setTokensReceived(0);
    setCreditsReceived(0);
    setStep("initial");

    if (closeBoxDialog) closeBoxDialog();
  };

  const handleGoToAnswering = () => {
    setTokensReceived(0);
    setCreditsReceived(0);
    setStep("initial");

    if (closeBoxDialog) closeBoxDialog();

    router.push("/application/answer");
  };

  const prizeCount =
    (creditsReceived > 0 ? 1 : 0) + (tokensReceived > 0 ? 1 : 0);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/90 mt-[3em] z-0 flex justify-center">
        {step == "initial" && (
          <div className="fixed z-100 flex flex-col items-center justify-center content-between my-16 gap-10">
            <h1 className={`text-[#DBFC8D] text-2xl font-bold`}>
              You earned a mystery box!
            </h1>

            <div className="text-center">
              You earned a mystery box.
              <br />
              Open it to receive your rewards.
            </div>

            <Image
              src={openChestImage}
              alt="Treasure Chest"
              title="Treasure Chest"
              className="my-16"
            />

            <Button
              variant={"primary"}
              onClick={openBox}
              disabled={isSubmitting}
            >
              Open Now
            </Button>

            <div className="text-sm cursor-pointer" onClick={handleClose}>
              Skip and miss out on your mystery box
            </div>
          </div>
        )}

        {step == "opened" && (
          <div className="fixed z-100 flex flex-col items-center justify-center content-between h-[75%] gap-10">
            <h1 className={`text-[#DBFC8D] text-2xl font-bold`}>
              CHOMP, CHOMP HOORAY!
            </h1>

            <Image
              src={openChestImage}
              alt="Treasure Chest"
              title="Treasure Chest"
            />

            <div className="flex flex-col gap-6 items-center">
              <div className={cn("grid gap-6", "grid-cols-" + prizeCount)}>
                {creditsReceived > 0 && (
                  <MysteryBoxPrize type="credits" amount={creditsReceived} />
                )}
                {tokensReceived > 0 && (
                  <MysteryBoxPrize type="tokens" amount={tokensReceived} />
                )}
              </div>

              {creditsReceived > 0 && (
                <div className="text-sm text-center">
                  Learn more about credits
                </div>
              )}
            </div>

            <div className="flex items-start items-center w-full content-center justify-center gap-2">
              <span className="text-sm grow-3">Total $BONK won to date</span>
              <MysteryBoxAmount type="tokens" amount={totalBonkWon} />
            </div>

            <Button variant={"primary"} onClick={handleGoToAnswering}>
              CHOMP on more decks →
            </Button>

            <div className="text-sm cursor-pointer" onClick={handleClose}>
              Close
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default MysteryBox;
