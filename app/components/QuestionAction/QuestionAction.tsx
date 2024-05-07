"use client";
import { QuestionType } from "@prisma/client";
import { useState } from "react";
import { Button } from "../Button/Button";
import { QuestionStep } from "../Question/Question";
import { TrueFalseScale } from "../TrueFalseScale/TrueFalseScale";

type QuestionOption = {
  id: number;
  option: string;
  isLeft: boolean;
};

type QuestionActionProps = {
  type: QuestionType;
  questionOptions?: QuestionOption[];
  onButtonClick: (answer?: number) => void;
  randomQuestionMarker?: string;
  step: QuestionStep;
};

export function QuestionAction({
  type,
  questionOptions,
  onButtonClick,
  step,
  randomQuestionMarker,
}: QuestionActionProps) {
  const [scale, setScale] = useState(50);

  if (type === "BinaryQuestion" && step === QuestionStep.AnswerQuestion) {
    return (
      <div className="text-center text-white font-semibold">
        <div className="text-md mb-4">
          What do you think about this statement?
        </div>
        <div className="flex gap-2">
          {questionOptions?.map((qo) => (
            <Button
              onClick={() => onButtonClick(qo.id)}
              variant="pink"
              key={qo.id}
              size="big"
            >
              {qo.option}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  if (
    type === "BinaryQuestion" &&
    step === QuestionStep.PickPercentage &&
    questionOptions
  ) {
    const optionLeft = questionOptions.find((qo) => qo.isLeft)?.option ?? "";
    const optionRight = questionOptions.find((qo) => !qo.isLeft)?.option ?? "";
    return (
      <div className="text-white font-semibold">
        <div className="text-center  text-md mb-4">
          How do you think others will respond?
        </div>
        <div className="flex gap-2 items-center">
          <div className="!w-[85%]">
            <TrueFalseScale
              ratioLeft={scale}
              progressBarClassName="h-[36px] rounded-md"
              handleRatioChange={setScale}
              labelLeft={optionLeft}
              labelRight={optionRight}
            />
          </div>
          <Button
            onClick={() => onButtonClick(scale)}
            variant="pink"
            size="big"
            className="!w-[15%]"
          >
            Chomp
          </Button>
        </div>
      </div>
    );
  }

  if (type === "MultiChoice" && step === QuestionStep.AnswerQuestion) {
    return (
      <div className="text-center text-white font-semibold">
        <div className="text-md mb-4">Choose your answer</div>
        <div>
          <Button onClick={() => onButtonClick()} variant="pink" size="big">
            Chomp
          </Button>
        </div>
      </div>
    );
  }

  if (type === "MultiChoice" && step === QuestionStep.PickPercentage) {
    return (
      <div className="text-center text-white font-semibold">
        <div className="text-md mb-4">
          How many people do you think picked {randomQuestionMarker}?
        </div>
        <div>
          <Button onClick={() => onButtonClick()} variant="pink" size="big">
            Chomp
          </Button>
        </div>
      </div>
    );
  }
  return <div></div>;
}
