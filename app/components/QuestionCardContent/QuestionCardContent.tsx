"use client";
import { sendAnswerToMixpanel } from "@/app/utils/mixpanel";
import { QuestionAnswer, QuestionType } from "@prisma/client";
import { AnswerResult } from "../AnswerResult/AnswerResult";
import { Question } from "../Deck/Deck";
import { QuestionStep } from "../Question/Question";
import { RadioInput } from "../RadioInput/RadioInput";

type QuestionOption = {
  id: number;
  option: string;
  questionAnswers?: QuestionAnswer[];
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
  className?: string;
  showRevealData?: boolean;
  question?: Question;
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
  className,
  showRevealData = false,
  question,
}: QuestionCardContentProps) {
  if (type === "BinaryQuestion") {
    return <></>;
  }

  if (type === "MultiChoice" && step === QuestionStep.AnswerQuestion) {
    return (
      <div className={className}>
        <RadioInput
          name="Multiple choice"
          options={
            questionOptions?.map((qo) => ({
              label: qo.option,
              value: qo.id.toString(),
              id: qo.id,
              questionAnswers: qo.questionAnswers || [],
            })) ?? []
          }
          onOptionSelected={(value) => {
            onOptionSelected(+value);
            if (question)
              sendAnswerToMixpanel(
                question,
                "FIRST_ORDER",
                undefined,
                undefined,
                questionOptions?.find((qo) => qo.id === +value)?.option,
              );
          }}
          value={optionSelectedId?.toString()}
          randomOptionPercentage={randomOptionPercentage}
          randomOptionId={randomOptionId}
          showRevealData={showRevealData}
        />
      </div>
    );
  }

  if (type === "MultiChoice" && step === QuestionStep.PickPercentage) {
    return (
      <div className={className}>
        {questionOptions?.map((qo, index) => (
          <div key={qo.id} className="mb-4">
            <AnswerResult
              index={index}
              answerText={qo.option}
              percentage={qo.id === randomOptionId ? (percentage ?? 0) : 0}
              handleRatioChange={
                qo.id === randomOptionId ? onPercentageChanged : undefined
              }
            />
          </div>
        ))}
      </div>
    );
  }

  return <div></div>;
}
