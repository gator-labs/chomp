"use client";
import { saveQuestion, SaveQuestionRequest } from "@/app/actions/answer";
import { useRandom } from "@/app/hooks/useRandom";
import { QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { getAlphaIdentifier } from "@/app/utils/question";

export enum QuestionStep {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

export const NUMBER_OF_STEPS_PER_QUESTION = 2;

type Option = {
  id: number;
  option: string;
};

type Question = {
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  imageUrl?: string;
  questionOptions: Option[];
};

type QuestionProps = {
  question: Question;
  returnUrl: string;
};

const getDueAt = (durationMiliseconds: number): Date => {
  return dayjs(new Date()).add(durationMiliseconds, "milliseconds").toDate();
};

export function Question({ question, returnUrl }: QuestionProps) {
  const router = useRouter();
  const [answerState, setAnswerState] = useState<SaveQuestionRequest>(
    {} as SaveQuestionRequest
  );
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const { random } = useRandom({
    min: 0,
    max:
      question.questionOptions.length > 0
        ? question.questionOptions.length - 1
        : 0,
  });
  const [currentQuestionStep, setCurrentQuestionStep] = useState<
    QuestionStep | undefined
  >(QuestionStep.AnswerQuestion);

  useEffect(() => {
    if (!currentQuestionStep) {
      router.replace(returnUrl);
      router.refresh();
    }
  }, [currentQuestionStep]);

  const handleSaveQuestion = useCallback(
    (answer: SaveQuestionRequest | undefined = undefined) => {
      setCurrentQuestionStep(undefined);
      saveQuestion(answer ?? answerState);
    },
    [setCurrentQuestionStep, answerState]
  );

  const onQuesitonActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        (question.type === "TrueFalse" || question.type === "YesNo")
      ) {
        setAnswerState({ questionId: question.id, questionOptionId: number });
        setCurrentQuestionStep(QuestionStep.PickPercentage);

        return;
      }

      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        question.type === "MultiChoice"
      ) {
        if (!currentOptionSelected) {
          return;
        }

        setAnswerState({
          questionId: question.id,
          questionOptionId: currentOptionSelected,
        });
        setCurrentQuestionStep(QuestionStep.PickPercentage);

        return;
      }

      if (
        currentQuestionStep === QuestionStep.PickPercentage &&
        (question.type === "TrueFalse" || question.type === "YesNo")
      ) {
        handleSaveQuestion({
          ...answerState,
          percentageGiven: number ?? 0,
        });
      }

      if (
        currentQuestionStep === QuestionStep.PickPercentage &&
        question.type === "MultiChoice"
      ) {
        handleSaveQuestion({
          ...answerState,
          percentageGiven: optionPercentage,
          percentageGivenForAnswerId: question.questionOptions[random]?.id,
        });
      }
    },
    [
      setCurrentQuestionStep,
      currentQuestionStep,
      question,
      currentOptionSelected,
      optionPercentage,
      setAnswerState,
      handleSaveQuestion,
      answerState,
    ]
  );

  return (
    <div>
      <div>
        <QuestionCard
          dueAt={getDueAt(question.durationMiliseconds)}
          numberOfSteps={NUMBER_OF_STEPS_PER_QUESTION}
          question={question.question}
          viewImageSrc={question.imageUrl}
          step={currentQuestionStep || QuestionStep.PickPercentage}
          onDurationRanOut={handleSaveQuestion}
          className="z-50 relative drop-shadow-question-card border-opacity-40"
        >
          <QuestionCardContent
            optionSelectedId={currentOptionSelected}
            onOptionSelected={setCurrentOptionSelected}
            type={question.type}
            step={currentQuestionStep || QuestionStep.PickPercentage}
            questionOptions={question.questionOptions}
            randomOptionId={question.questionOptions[random]?.id}
            percentage={optionPercentage}
            onPercentageChanged={setOptionPercentage}
          />
        </QuestionCard>
      </div>
      <div className="pt-2">
        <QuestionAction
          onButtonClick={onQuesitonActionClick}
          type={question.type}
          step={currentQuestionStep || QuestionStep.PickPercentage}
          questionOptions={question.questionOptions}
          randomQuestionMarker={getAlphaIdentifier(random)}
        />
      </div>
    </div>
  );
}
