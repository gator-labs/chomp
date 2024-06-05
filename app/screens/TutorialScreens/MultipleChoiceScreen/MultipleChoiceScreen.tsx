import { Button } from "@/app/components/Button/Button";
import { QuestionStep } from "@/app/components/Question/Question";
import { QuestionAction } from "@/app/components/QuestionAction/QuestionAction";
import { QuestionCard } from "@/app/components/QuestionCard/QuestionCard";
import { QuestionCardContent } from "@/app/components/QuestionCardContent/QuestionCardContent";
import Tooltip from "@/app/components/Tooltip/Tooltip";
import { ONE_MINUTE_IN_MILISECONDS } from "@/app/utils/dateUtils";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { STEPS } from "./constants";

interface Props {
  setActiveScreen: Dispatch<
    SetStateAction<"binary-question" | "multiple-choice" | "reveal" | null>
  >;
}

const getDueAt = (durationMiliseconds: number): Date => {
  return dayjs(new Date()).add(durationMiliseconds, "milliseconds").toDate();
};

const MultipleChoiceScreen = ({ setActiveScreen }: Props) => {
  const { user } = useDynamicContext();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [dueAt, setDueAt] = useState(getDueAt(ONE_MINUTE_IN_MILISECONDS));
  const [tooltipIndex, setTooltipIndex] = useState(0);
  const [isFlowFinished, setIsFlowFinished] = useState(false);

  const [othersResponseScale, setOthersResponseScale] = useState(50);

  const handleGoToNextTooltip = () => {
    if (tooltipIndex === STEPS.length - 1) return;

    setTooltipIndex((curr) => curr + 1);
  };

  useEffect(() => {
    if (!!currentOptionSelected) {
      setTooltipIndex((curr) => curr + 1);
    }
  }, [currentOptionSelected]);

  useEffect(() => {
    if (tooltipIndex === STEPS.length - 1) {
      setIsFlowFinished(true);
    }
  }, [tooltipIndex]);

  useEffect(() => {
    localStorage.setItem(
      `${user?.userId}-seen-tutorial-screens`,
      JSON.stringify(["binary-question", "multiple-choice"]),
    );
  }, []);

  return (
    <>
      <div className="flex flex-col justify-between h-full pointer-events-auto px-4">
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
            question="Which of the following is NOT a DEX?"
            type={QuestionType.MultiChoice}
            viewImageSrc="/test"
            onDurationRanOut={() =>
              setDueAt(getDueAt(ONE_MINUTE_IN_MILISECONDS))
            }
            className={`relative max-w-[450px] mx-auto drop-shadow-question-card border-opacity-40 ${STEPS[tooltipIndex].isQuestionCardTooltip ? "z-0" : "-z-10"}`}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={QuestionType.MultiChoice}
              step={QuestionStep.AnswerQuestion}
              percentage={optionPercentage}
              randomOptionPercentage={othersResponseScale}
              questionOptions={[
                { id: 1, option: "Jupiter" },
                { id: 2, option: "Raydium" },
                { id: 3, option: "Orca" },
                { id: 4, option: "Phoenix" },
              ]}
              randomOptionId={tooltipIndex > 0 ? 2 : undefined}
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
              type={QuestionType.MultiChoice}
              step={STEPS[tooltipIndex].questionActionStep}
              randomQuestionMarker="B"
              percentage={othersResponseScale}
              setPercentage={setOthersResponseScale}
            />
          </div>
        </Tooltip>
      </div>
      {isFlowFinished && (
        <div className="fixed bottom-[108px] w-full p-6 bg-[#333333] flex flex-col gap-6 rounded-t-[32px] max-w-lg pointer-events-auto">
          <h3 className="text-base">You did it again! 🎉</h3>
          <p className="text-sm">
            Let’s check out the answers for the questions you just chomped.
          </p>
          <Button
            variant="white"
            className="rounded-[32px]"
            onClick={() => setActiveScreen("reveal")}
          >
            Next
          </Button>
        </div>
      )}
    </>
  );
};

export default MultipleChoiceScreen;
