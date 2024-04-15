"use client";
import { useSteppingChange } from "@/app/hooks/useSteppingChange";
import { QuestionType } from "@prisma/client";
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

  if (type === "MultiChoice" && step === QuestionStep.AnswerQuestion) {
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

  if (type === "MultiChoice" && step === QuestionStep.PickPercentage) {
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
