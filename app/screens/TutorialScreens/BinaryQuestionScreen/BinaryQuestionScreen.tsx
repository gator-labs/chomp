"use client";

import { Button } from "@chomp/app/components/Button/Button";
import { HalfArrowRightIcon } from "@chomp/app/components/Icons/HalfArrowRightIcon";
import { QuestionStep } from "@chomp/app/components/Question/Question";
import { QuestionAction } from "@chomp/app/components/QuestionAction/QuestionAction";
import { QuestionCard } from "@chomp/app/components/QuestionCard/QuestionCard";
import { QuestionCardContent } from "@chomp/app/components/QuestionCardContent/QuestionCardContent";
import Tooltip from "@chomp/app/components/Tooltip/Tooltip";
import { getDueAt, ONE_MINUTE_IN_MILISECONDS } from "@chomp/app/utils/dateUtils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { QuestionType } from "@prisma/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { STEPS } from "./constants";

interface Props {
  setActiveScreen: Dispatch<
    SetStateAction<"binary-question" | "multiple-choice" | "reveal" | null>
  >;
}

const BinaryQuestionScreen = ({ setActiveScreen }: Props) => {
  const { user } = useDynamicContext();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [dueAt, setDueAt] = useState(getDueAt(ONE_MINUTE_IN_MILISECONDS));
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  const handleGoToNextTooltip = () => {
    if (tooltipIndex === STEPS.length - 1) return;
    if (tooltipIndex === 1) {
      const tutorialContainer = document.getElementById("tutorial-container")!;

      tutorialContainer.scroll({
        top: tutorialContainer!.scrollHeight,
        behavior: "smooth",
      });
    }
    setTooltipIndex((curr) => curr + 1);
  };

  useEffect(() => {
    if (tooltipIndex === STEPS.length - 1) {
      setIsFlowFinished(true);
    }
  }, [tooltipIndex]);

  useEffect(() => {
    localStorage.setItem(
      `${user?.userId}-seen-tutorial-screens`,
      JSON.stringify(["binary-question"]),
    );
  }, []);

  return (
    <>
      <div className="flex flex-col justify-between w-full h-full pointer-events-auto px-6">
        <Tooltip
          infoText={STEPS[tooltipIndex].text}
          alwaysVisible={
            STEPS[tooltipIndex].isQuestionCardTooltip &&
            STEPS[tooltipIndex].isTooltip
          }
          position={STEPS[tooltipIndex].position as any}
          style={STEPS[tooltipIndex].style}
          disabledHover
        >
          <QuestionCard
            dueAt={dueAt}
            question="Was SBF a net positive for Solana?"
            type={QuestionType.BinaryQuestion}
            viewImageSrc="/test"
            onDurationRanOut={() =>
              setDueAt(getDueAt(ONE_MINUTE_IN_MILISECONDS))
            }
            className={`relative w-full mx-auto drop-shadow-question-card border-opacity-40 ${STEPS[tooltipIndex].isQuestionCardTooltip ? "z-0" : "!-z-10"}`}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={QuestionType.BinaryQuestion}
              step={QuestionStep.PickPercentage}
              percentage={optionPercentage}
            />
          </QuestionCard>
        </Tooltip>

        <Tooltip
          infoText={STEPS[tooltipIndex].text}
          alwaysVisible={
            !STEPS[tooltipIndex].isQuestionCardTooltip &&
            STEPS[tooltipIndex].isTooltip
          }
          position={STEPS[tooltipIndex].position as any}
          style={STEPS[tooltipIndex].style}
          disabledHover
        >
          <div
            className={`py-2 w-full relative ${
              STEPS[tooltipIndex].isQuestionCardTooltip ||
              !STEPS[tooltipIndex].isTooltip
                ? "-z-10"
                : "z-0"
            }`}
          >
            <QuestionAction
              onButtonClick={handleGoToNextTooltip}
              type={QuestionType.BinaryQuestion}
              step={STEPS[tooltipIndex].questionActionStep}
              questionOptions={[
                { id: 1, option: "yes", isLeft: true },
                { id: 2, option: "no", isLeft: false },
              ]}
              percentage={optionPercentage}
              setPercentage={setOptionPercentage}
            />
          </div>
        </Tooltip>
      </div>
      {STEPS[tooltipIndex].isQuestionCardTooltip && (
        <div className="fixed bottom-5 max-w-[30rem] left-1/2 -translate-x-1/2 gap-1 w-full max-md:px-6">
          <Button
            onClick={handleGoToNextTooltip}
            className="pointer-events-auto"
            variant="purple"
          >
            Next
            <HalfArrowRightIcon fill="#0D0D0D" />
          </Button>
        </div>
      )}
      {isFlowFinished && (
        <div className="fixed bottom-[0px] w-full p-6 bg-[#333333] flex flex-col gap-6 rounded-t-[32px] left-1/2 -translate-x-1/2 !max-w-[30rem] pointer-events-auto">
          <h3 className="text-base">Well done! 🎉</h3>
          <p className="text-sm">
            Now let&apos;s try a <b>multiple choice</b> question
          </p>
          <Button
            variant="white"
            className="rounded-[32px]"
            onClick={() => setActiveScreen("multiple-choice")}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default BinaryQuestionScreen;
