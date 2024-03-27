"use client";
import { QuestionType } from "@prisma/client";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import dayjs from "dayjs";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { Button } from "../Button/Button";
import { DeckRequest, saveDeck } from "../../actions/deck";
import { useRouter } from "next/navigation";

type Option = {
  id: number;
  option: string;
};

export type Question = {
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  questionOptions: Option[];
};

type DeckProps = {
  questions: Question[];
  browseHomeUrl: string;
};

export enum DeckStep {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

const getDueAt = (questions: Question[], index: number): Date => {
  return dayjs(new Date())
    .add(questions[index].durationMiliseconds, "milliseconds")
    .toDate();
};

export function Deck({ questions, browseHomeUrl }: DeckProps) {
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [rerenderAction, setRerednerAction] = useState(true);
  const router = useRouter();
  const [deckResponse, setDeckResponse] = useState<DeckRequest[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<DeckStep>(
    DeckStep.AnswerQuestion
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleNextIndex = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getDueAt(questions, currentQuestionIndex + 1));
    }
    setCurrentQuestionIndex((index) => index + 1);
    setCurrentQuestionStep(DeckStep.AnswerQuestion);
    setRerednerAction(false);
    setTimeout(() => {
      setRerednerAction(true);
    });
  }, [
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setCurrentQuestionStep,
    setRerednerAction,
  ]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex]
  );
  const onQuesitonActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === DeckStep.AnswerQuestion &&
        question.type === "TrueFalse"
      ) {
        setDeckResponse((prev) => [
          ...prev,
          { questionId: question.id, questionOptionId: number ?? 0 },
        ]);
        setCurrentQuestionStep(DeckStep.PickPercentage);
      }

      if (
        currentQuestionStep === DeckStep.PickPercentage &&
        question.type === "TrueFalse"
      ) {
        setDeckResponse((prev) => {
          const newResposnes = [...prev];
          const response = newResposnes.pop();
          if (response) {
            response.percentageGiven = number ?? 0;
            newResposnes.push(response);
          }

          return newResposnes;
        });

        handleNextIndex();
      }
    },
    [
      setDeckResponse,
      setCurrentQuestionStep,
      currentQuestionStep,
      question,
      handleNextIndex,
    ]
  );

  const hasReachedEnd = useMemo(
    () => currentQuestionIndex >= questions.length,
    [currentQuestionIndex]
  );

  useEffect(() => {
    if (hasReachedEnd) {
      saveDeck(deckResponse);
    }
  }, [hasReachedEnd, deckResponse]);

  if (questions.length === 0 || hasReachedEnd) {
    return (
      <div className="flex flex-col justify-between h-full">
        <NoQuestionsCard />
        <Button
          variant="pink"
          size="big"
          className="mt-2"
          onClick={() => browseHomeUrl && router.push(browseHomeUrl)}
        >
          Browse home
        </Button>
      </div>
    );
  }

  const questionOffset = 70 * (questions.length - currentQuestionIndex - 1);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="relative" style={{ marginBottom: questionOffset + "px" }}>
        {Array.from(
          Array(questions.length - (currentQuestionIndex + 1)).keys()
        ).map((index) => (
          <QuestionCard
            key={index}
            numberOfSteps={2}
            question={questions[index].question}
            step={1}
            className="absolute drop-shadow-question-card border-opacity-40"
            style={{
              zIndex: 10 + questions.length + index,
              top: 70 * index + "px",
            }}
            isBlurred
          />
        ))}
        <QuestionCard
          dueAt={dueAt}
          numberOfSteps={2}
          question={question.question}
          step={currentQuestionStep}
          onDurationRanOut={handleNextIndex}
          className="z-50 relative drop-shadow-question-card border-opacity-40"
          style={{
            transform: `translateY(${questionOffset}px)`,
          }}
        ></QuestionCard>
      </div>
      <div className="pt-2">
        {rerenderAction && (
          <QuestionAction
            onButtonClick={onQuesitonActionClick}
            type={question.type}
            step={currentQuestionStep}
            questionOptions={question.questionOptions}
          />
        )}
      </div>
    </div>
  );
}
