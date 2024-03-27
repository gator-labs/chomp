"use client";
import { QuestionType } from "@prisma/client";
import { DeckStep } from "../Deck/Deck";
import { RadioInput } from "../RadioInput/RadioInput";
import { AnswerResult } from "../AnswerResult/AnswerResult";
import { useEffect, useState } from "react";
import { useSteppingChange } from "@/app/hooks/useSteppingChange";

type QuestionOption = {
  id: number;
  option: string;
};

type QuestionCardContentProps = {
  type: QuestionType;
  questionOptions?: QuestionOption[];
  optionSelectedId?: number;
  onOptionSelected: (answer?: number) => void;
  step: DeckStep;
  randomOptionId?: number;
  percentage?: number;
  onPercentageChanged?: (percentage: number) => void;
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
}: QuestionCardContentProps) {
  const { handlePercentageChange } = useSteppingChange({
    percentage: percentage ?? 0,
    onPercentageChange: onPercentageChanged,
  });

  if (type === "TrueFalse") {
    return <></>;
  }

  if (type === "MultiChoice" && step === DeckStep.AnswerQuestion) {
    return (
      <div>
        <RadioInput
          name="Multiple choice"
          options={
            questionOptions?.map((qo) => ({
              label: qo.option,
              value: qo.id.toString(),
            })) ?? []
          }
          onOptionSelected={(value) => onOptionSelected(+value)}
          value={optionSelectedId?.toString()}
        />
      </div>
    );
  }

  if (type === "MultiChoice" && step === DeckStep.PickPercentage) {
    return (
      <div>
        {questionOptions?.map((qo) => (
          <div key={qo.id} className="mb-2">
            <AnswerResult
              answerText={qo.option}
              percentage={qo.id === randomOptionId ? percentage ?? 0 : 0}
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
