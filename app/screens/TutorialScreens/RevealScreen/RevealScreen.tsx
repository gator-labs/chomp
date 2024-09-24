"use client";

import { addTutorialPoints } from "@/app/actions/answer";
import { Button } from "@/app/components/Button/Button";
import { DashboardUserStats } from "@/app/components/DashboardUserStats/DashboardUserStats";
import { ClockIcon } from "@/app/components/Icons/ClockIcon";
import { DollarIcon } from "@/app/components/Icons/DollarIcon";
import { EyeIcon } from "@/app/components/Icons/EyeIcon";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import Trophy from "@/app/components/Icons/Trophy";
import { QuestionStep } from "@/app/components/Question/Question";
import { QuestionCard } from "@/app/components/QuestionCard/QuestionCard";
import { QuestionCardContent } from "@/app/components/QuestionCardContent/QuestionCardContent";
import Spinner from "@/app/components/Spinner/Spinner";
import Tooltip from "@/app/components/Tooltip/Tooltip";
import { useConfetti } from "@/app/providers/ConfettiProvider";
import { useToast } from "@/app/providers/ToastProvider";
import { QuestionType, User } from "@prisma/client";
import classNames from "classnames";
import Link from "next/link";
import { Suspense, useState } from "react";

interface Props {
  isCorrectFirstOrderMultipleQuestion: boolean;
  currentUser: User;
}

const RevealScreen = ({
  isCorrectFirstOrderMultipleQuestion,
  currentUser,
}: Props) => {
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"reveal" | "claim">(
    "reveal",
  );
  const [activeClaimScreenStep, setActiveClaimScreenStep] = useState<
    "congrats-step" | "claim-step" | "final-step"
  >("congrats-step");
  const [isClaiming, setIsClaiming] = useState(false);
  const { fire } = useConfetti();

  const { successToast } = useToast();

  const handleClaim = async () => {
    setIsClaiming(true);
    fire();
    await addTutorialPoints(isCorrectFirstOrderMultipleQuestion);
    successToast("Claimed!", "You have successfully claimed!");

    setActiveClaimScreenStep("final-step");
    setIsClaiming(false);
  };

  if (currentScreen === "reveal")
    return (
      <div className="px-6">
        <Suspense fallback={<Spinner />}>
          <DashboardUserStats />
        </Suspense>{" "}
        <div className="pt-4 flex flex-col gap-2 overflow-hidden">
          <Tooltip
            infoText="Click reveal to see the answer."
            alwaysVisible={!isRevealModalOpen}
            disabledHover
            position="bottom"
            className="max-w-[160px]"
          >
            <div
              className={classNames(
                "p-4 flex flex-col gap-2 relative bg-gray-700 border-gray-500 border-[0.5px] rounded-lg w-full",
                {
                  "z-10 pointer-events-auto": !isRevealModalOpen,
                  "-z-10": isRevealModalOpen,
                },
              )}
            >
              <p className="text-sm font-normal">
                The best way to secure your assets is to use a hardware wallet
              </p>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ClockIcon width={18} height={18} />
                  <p className="text-xs font-normal">Revealed 18h ago</p>
                </div>
                <p className="text-xs font-normal text-aqua">Chomped</p>
              </div>
              <Button
                variant="grayish"
                className="h-[50px] gap-1"
                onClick={() => setIsRevealModalOpen(true)}
              >
                Reveal
                <EyeIcon />
              </Button>
            </div>
          </Tooltip>

          <div className="p-4 flex flex-col gap-2 relative -z-10 bg-gray-700 border-gray-500 border-[0.5px] rounded-lg">
            <p className="text-sm font-normal">
              The best way to secure your assets is to use a hardware wallet
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClockIcon width={18} height={18} />
                <p className="text-xs font-normal">Revealed 18h ago</p>
              </div>
              <p className="text-xs font-normal text-aqua">Chomped</p>
            </div>
            <Button variant="grayish" className="h-[50px] gap-1">
              Reveal
              <EyeIcon />
            </Button>
          </div>
          <div className="p-4 flex flex-col gap-2 relative -z-10 bg-gray-700 border-gray-500 border-[0.5px] rounded-lg">
            <p className="text-sm font-normal">
              The best way to secure your assets is to use a hardware wallet
            </p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClockIcon width={18} height={18} />
                <p className="text-xs font-normal">Revealed 18h ago</p>
              </div>
              <p className="text-xs font-normal">View</p>
            </div>
          </div>
        </div>
        {isRevealModalOpen && (
          <div className="fixed bottom-[0px] w-full p-6 bg-gray-700 flex flex-col gap-6 rounded-t-[32px] left-1/2 -translate-x-1/2 !max-w-[30rem] pointer-events-auto">
            <h3 className="text-base">Reveal answer?</h3>
            <p className="text-sm">
              This action burns <b>5,000 BONK.</b>{" "}
            </p>
            <div className="flex flex-col gap-2">
              <Tooltip
                infoText="Revealing burns a small amount of BONK—but gives you the chance to win BONK rewards!

              (Revealing is free for this tutorial)"
                alwaysVisible
                disabledHover
                position="top"
                style={{
                  position: "absolute",
                  top: "-90px",
                }}
              >
                <Button
                  variant="white"
                  className="!rounded-[32px] h-10"
                  onClick={() => setCurrentScreen("claim")}
                >
                  Reveal
                </Button>
              </Tooltip>
              <Button variant="black" className="!rounded-[32px] h-10">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    );

  if (currentScreen === "claim") {
    return (
      <>
        <div className="px-4 w-full flex flex-col gap-4">
          <Tooltip
            infoText="If this were a real question (not a tutorial), you would have won up to 10,000 BONK for answering 'Jupiter'! 🎊"
            alwaysVisible={activeClaimScreenStep === "congrats-step"}
            disabledHover
            position="bottom"
            className="!max-w-[90%]"
          >
            <div
              className={classNames(
                "p-4 flex bg-gray-700 rounded-md justify-between w-full",
                {
                  "z-10 pointer-events-auto":
                    activeClaimScreenStep === "congrats-step",
                  "-z-10": activeClaimScreenStep !== "congrats-step",
                },
              )}
            >
              <div className="flex flex-col gap-4 max-w-[210px] w-full justify-between">
                <p>Congrats, you won!</p>
                <div className="h-[1px] w-full bg-gray-500" />
                <div className="flex items-center gap-1 justify-between">
                  <p className="text-sm">Claim reward:</p>
                  <div className="px-4 py-2 bg-white flex items-center justify-center rounded-3xl">
                    <p className="text-xs text-gray-900 font-bold">
                      10,000 BONK
                    </p>
                  </div>
                </div>
              </div>
              <Trophy width={70} height={85} />
            </div>
          </Tooltip>
          <QuestionCard
            question="Which of the following is NOT a DEX?"
            type={QuestionType.MultiChoice}
            className="relative w-full mx-auto drop-shadow-question-card border-opacity-40 -z-20"
          >
            <QuestionCardContent
              onOptionSelected={() => {}}
              type={QuestionType.MultiChoice}
              step={QuestionStep.AnswerQuestion}
              optionSelectedId={1}
              questionOptions={[
                { id: 1, option: "Jupiter" },
                { id: 2, option: "Raydium" },
                { id: 3, option: "Orca" },
                { id: 4, option: "Phoenix" },
              ]}
            />
          </QuestionCard>

          <Tooltip
            infoText="The final step is to claim your reward 💰"
            alwaysVisible={activeClaimScreenStep === "claim-step"}
            disabledHover
            position="top"
          >
            <div
              className={classNames("flex flex-col items-center gap-4 w-full", {
                "z-10 pointer-events-auto":
                  activeClaimScreenStep === "claim-step",
                "-z-10": activeClaimScreenStep !== "claim-step",
              })}
            >
              <div className="flex items-center gap-1 justify-between">
                <p className="text-sm">Your claimable reward:</p>
                <div className="px-4 py-2 bg-white flex items-center justify-center rounded-3xl">
                  <p className="text-xs text-gray-900 font-bold">10,000 BONK</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <Button
                  variant="purple"
                  className="h-[50px] w-full"
                  onClick={async () => {
                    if (isClaiming) return;

                    if (!!currentUser.tutorialCompletedAt) {
                      fire();
                      setActiveClaimScreenStep("final-step");
                      return;
                    }

                    return handleClaim();
                  }}
                >
                  Claim
                  <DollarIcon />
                </Button>
              </div>
            </div>
          </Tooltip>
        </div>

        {activeClaimScreenStep === "congrats-step" && (
          <div className="fixed bottom-5 max-w-[30rem] left-1/2 -translate-x-1/2 gap-1 w-full max-md:px-6">
            <Button
              onClick={() => {
                const tutoiralContainer =
                  document.getElementById("tutorial-container")!;

                tutoiralContainer.scroll({
                  top: tutoiralContainer!.scrollHeight,
                  behavior: "smooth",
                });

                setActiveClaimScreenStep("claim-step");
              }}
              className="pointer-events-auto"
              variant="purple"
            >
              Next
              <HalfArrowRightIcon fill="#FFFFFF" />
            </Button>
          </div>
        )}

        {activeClaimScreenStep === "final-step" && (
          <div className="fixed bottom-[0px] w-full p-6 bg-gray-700 flex flex-col gap-6 rounded-t-[32px] left-1/2 -translate-x-1/2 !max-w-[30rem] pointer-events-auto">
            <h3 className="text-base">Well done! 🎉</h3>
            <p className="text-sm">Now you’re ready to Chomp for real!</p>
            <Link href="/application">
              <Button variant="white" className="!rounded-[32px]">
                Yes LFG!{" "}
              </Button>
            </Link>
          </div>
        )}
      </>
    );
  }
};

export default RevealScreen;
