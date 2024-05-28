"use client";
import { QuestionType } from "@prisma/client";
import { useState } from "react";
import { AnswerResult } from "../AnswerResult/AnswerResult";
import { QuestionStep } from "../Question/Question";
import { RadioInput } from "../RadioInput/RadioInput";

type QuestionOption = {
  id: number;
  option: string;
};

type QuestionCardContentProps = {
  type: QuestionType;
  questionOptions?: QuestionOption[];
  optionSelectedId?: number;
  onOptionSelected: (answer?: number) => void;
  step: QuestionStep;
  randomOptionId?: number;
  percentage?: number;
  onPercentageChanged?: (percentage: number) => void;
  randomOptionPercentage?: number;
};

export function QuestionCardContent({
  type,
  questionOptions,
  optionSelectedId,
  onOptionSelected,
  step,
  randomOptionId,
  percentage,
  onPercentageChanged,
  randomOptionPercentage,
}: QuestionCardContentProps) {
  const [handlePercentage, setHandlePercentage] = useState<number>(50);

  const handlePercentageChange = (newPercentage: number) => {
    setHandlePercentage(newPercentage);
    onPercentageChanged && onPercentageChanged(newPercentage);
  };

  if (type === "BinaryQuestion") {
    return <></>;
  }

  if (type === "MultiChoice" && step === QuestionStep.AnswerQuestion) {
    return (
      <div>
        <RadioInput
          name="Multiple choice"
          options={
            questionOptions?.map((qo) => ({
              label: qo.option,
              value: qo.id.toString(),
              id: qo.id,
            })) ?? []
          }
          onOptionSelected={(value) => onOptionSelected(+value)}
          value={optionSelectedId?.toString()}
          randomOptionPercentage={randomOptionPercentage}
          randomOptionId={randomOptionId}
        />
      </div>
    );
  }

  if (type === "MultiChoice" && step === QuestionStep.PickPercentage) {
    return (
      <div>
        {questionOptions?.map((qo) => (
          <div key={qo.id} className="mb-2">
            <AnswerResult
              answerText={qo.option}
              percentage={qo.id === randomOptionId ? handlePercentage ?? 0 : 0}
              handleRatioChange={
                qo.id === randomOptionId ? handlePercentageChange : undefined
              }
            />
          </div>
        ))}
      </div>
    );
  }

  return <div></div>;
}
