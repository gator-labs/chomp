"use client";

import { Button } from "@/app/components/Button/Button";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import { QuestionStep } from "@/app/components/Question/Question";
import { QuestionAction } from "@/app/components/QuestionAction/QuestionAction";
import { QuestionCard } from "@/app/components/QuestionCard/QuestionCard";
import { QuestionCardContent } from "@/app/components/QuestionCardContent/QuestionCardContent";
import Tooltip from "@/app/components/Tooltip/Tooltip";
import { ONE_MINUTE_IN_MILISECONDS } from "@/app/utils/dateUtils";
import { QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { STEPS } from "./constants";

const getDueAt = (durationMiliseconds: number): Date => {
  return dayjs(new Date()).add(durationMiliseconds, "milliseconds").toDate();
};

interface Props {
  setActiveScreen: Dispatch<
    SetStateAction<"binary-question" | "multiple-choice" | "reveal">
  >;
}

const BinaryQuestionScreen = ({ setActiveScreen }: Props) => {
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [dueAt, setDueAt] = useState(getDueAt(ONE_MINUTE_IN_MILISECONDS));
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  const handleGoToNextTooltip = () => {
    if (tooltipIndex === STEPS.length - 1) return;
    setTooltipIndex((curr) => curr + 1);
  };

  useEffect(() => {
    if (tooltipIndex === STEPS.length - 1) {
      setIsFlowFinished(true);
    }
  }, [tooltipIndex]);

  return (
    <>
      <div className="flex flex-col justify-between h-full pointer-events-auto px-4 mt-16 overflow-y-hidden">
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
            numberOfSteps={0}
            question="The best way to secure your assets is to use a hardware wallet."
            type={QuestionType.BinaryQuestion}
            viewImageSrc="/test"
            step={0}
            onDurationRanOut={() =>
              setDueAt(getDueAt(ONE_MINUTE_IN_MILISECONDS))
            }
            className={`relative max-w-[450px] mx-auto drop-shadow-question-card border-opacity-40 ${STEPS[tooltipIndex].isQuestionCardTooltip ? "z-0" : "-z-10"}`}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={QuestionType.BinaryQuestion}
              step={QuestionStep.PickPercentage}
              percentage={optionPercentage}
              onPercentageChanged={setOptionPercentage}
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
            className={`pt-2 pb-[53px] w-full relative ${
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
            />
          </div>
        </Tooltip>
      </div>
      {STEPS[tooltipIndex].isQuestionCardTooltip && (
        <Button
          onClick={handleGoToNextTooltip}
          className="fixed bottom-5 pointer-events-auto !w-[calc(100%-32px)] left-1/2 -translate-x-1/2 max-w-lg gap-1"
          variant="purple"
        >
          Next
          <HalfArrowRightIcon fill="#0D0D0D" />
        </Button>
      )}
      {isFlowFinished && (
        <div className="fixed bottom-[108px] w-full p-6 bg-[#333333] flex flex-col gap-6 rounded-t-[32px] max-w-lg pointer-events-auto">
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
