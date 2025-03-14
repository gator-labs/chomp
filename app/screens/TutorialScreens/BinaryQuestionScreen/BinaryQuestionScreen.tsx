"use client";

import { Button } from "@/app/components/Button/Button";
import { HalfArrowRightIcon } from "@/app/components/Icons/HalfArrowRightIcon";
import { QuestionAction } from "@/app/components/QuestionAction/QuestionAction";
import { QuestionCard } from "@/app/components/QuestionCard/QuestionCard";
import { QuestionCardContent } from "@/app/components/QuestionCardContent/QuestionCardContent";
import Tooltip from "@/app/components/Tooltip/Tooltip";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import TutorialAIImage from "@/public/images/TutorialAIImage.png";
import { QuestionStep } from "@/types/question";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { STEPS } from "./constants";

const getDueAt = (durationMiliseconds: number): Date => {
  return dayjs(new Date()).add(durationMiliseconds, "milliseconds").toDate();
};

interface Props {
  setActiveScreen: Dispatch<
    SetStateAction<"binary-question" | "multiple-choice" | null>
  >;
}

const BinaryQuestionScreen = ({ setActiveScreen }: Props) => {
  const { user } = useDynamicContext();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [dueAt, setDueAt] = useState(getDueAt(ONE_MINUTE_IN_MILLISECONDS));
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  const handleGoToNextTooltip = () => {
    if (tooltipIndex === STEPS.length - 1) return;
    if (tooltipIndex === 1) {
      const tutoiralContainer = document.getElementById("tutorial-container")!;

      tutoiralContainer.scroll({
        top: tutoiralContainer!.scrollHeight,
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
      <div className="flex flex-col justify-start gap-10 w-full h-full pointer-events-auto px-4">
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
            question="Is this Image AI Generated or Real?"
            type={QuestionType.BinaryQuestion}
            onDurationRanOut={() =>
              setDueAt(getDueAt(ONE_MINUTE_IN_MILLISECONDS))
            }
            viewImageSrc={TutorialAIImage.src}
            className={`relative w-full mx-auto drop-shadow-question-card border-opacity-40 h-[calc(100vh_-_400px)] ${STEPS[tooltipIndex].isQuestionCardTooltip ? "z-0" : "!-z-10"}`}
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
                { id: 1, option: "AI Generated", isLeft: true },
                { id: 2, option: "Real", isLeft: false },
              ]}
              percentage={optionPercentage}
              setPercentage={setOptionPercentage}
              randomQuestionMarker={"AI Generated"}
            />
          </div>
        </Tooltip>
      </div>
      {STEPS[tooltipIndex].isQuestionCardTooltip && (
        <div className="fixed bottom-5 max-w-[30rem] left-1/2 -translate-x-1/2 gap-1 w-full max-md:px-6 h-12">
          <Button
            onClick={handleGoToNextTooltip}
            className="pointer-events-auto"
            variant="purple"
          >
            Next
            <HalfArrowRightIcon fill="#FFFFFF" />
          </Button>
        </div>
      )}
      {isFlowFinished && (
        <div className="fixed bottom-[0px] w-full p-6 bg-gray-700 flex flex-col gap-6 rounded-t-[32px] left-1/2 -translate-x-1/2 !max-w-[30rem] pointer-events-auto">
          <h3 className="text-base">Well done! 🎉</h3>
          <p className="text-sm">
            Now let’s try a <b>multiple choice</b> question!
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
