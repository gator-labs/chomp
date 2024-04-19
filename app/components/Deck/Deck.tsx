"use client";
import { SaveQuestionRequest, saveDeck } from "@/app/actions/answer";
import { useRandom } from "@/app/hooks/useRandom";
import { getAlphaIdentifier } from "@/app/utils/question";
import { QuestionTag, QuestionType, Tag } from "@prisma/client";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnswerHeader } from "../AnswerHeader/AnswerHeader";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import {
  NUMBER_OF_STEPS_PER_QUESTION,
  QuestionStep,
} from "../Question/Question";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";

export type Option = {
  id: number;
  option: string;
};

export type Question = {
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  imageUrl?: string;
  questionOptions: Option[];
  questionTags: (QuestionTag & { tag: Tag })[];
};

type DeckProps = {
  questions: Question[];
  browseHomeUrl?: string;
  deckId: number;
};

const getDueAt = (questions: Question[], index: number): Date => {
  return dayjs(new Date())
    .add(questions[index].durationMiliseconds, "milliseconds")
    .toDate();
};

export function Deck({ questions, browseHomeUrl, deckId }: DeckProps) {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [rerenderAction, setRerednerAction] = useState(true);
  const [deckResponse, setDeckResponse] = useState<SaveQuestionRequest[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<QuestionStep>(
    QuestionStep.AnswerQuestion,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const { random, generateRandom } = useRandom({
    min: 0,
    max:
      questions[currentQuestionIndex] &&
      questions[currentQuestionIndex].questionOptions.length > 0
        ? questions[currentQuestionIndex].questionOptions.length - 1
        : 0,
  });

  const handleNextIndex = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getDueAt(questions, currentQuestionIndex + 1));
    }
    setCurrentQuestionIndex((index) => index + 1);
    setCurrentQuestionStep(QuestionStep.AnswerQuestion);
    setRerednerAction(false);
    setOptionPercentage(50);
    setCurrentOptionSelected(undefined);
    generateRandom();
    setTimeout(() => {
      setRerednerAction(true);
    });
    setTimeout(() => {
      if (questionsRef.current) {
        questionsRef.current.scrollTop = questionsRef.current?.scrollHeight;
      }
    }, 200);
  }, [
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setCurrentQuestionStep,
    setRerednerAction,
    generateRandom,
    setCurrentOptionSelected,
    questionsRef.current,
  ]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  const handleNoAnswer = useCallback(() => {
    setDeckResponse((prev) => [...prev, { questionId: question.id }]);
    handleNextIndex();
  }, [question, handleNextIndex, setDeckResponse]);

  const onQuesitonActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        (question.type === "TrueFalse" || question.type === "YesNo")
      ) {
        setDeckResponse((prev) => [
          ...prev,
          { questionId: question.id, questionOptionId: number },
        ]);
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

        setDeckResponse((prev) => [
          ...prev,
          {
            questionId: question.id,
            questionOptionId: currentOptionSelected,
          },
        ]);
        setCurrentQuestionStep(QuestionStep.PickPercentage);

        return;
      }

      if (
        currentQuestionStep === QuestionStep.PickPercentage &&
        (question.type === "TrueFalse" || question.type === "YesNo")
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
      }

      if (
        currentQuestionStep === QuestionStep.PickPercentage &&
        question.type === "MultiChoice"
      ) {
        setDeckResponse((prev) => {
          const newResposnes = [...prev];
          const response = newResposnes.pop();
          if (response) {
            response.percentageGiven = optionPercentage;
            response.percentageGivenForAnswerId =
              question.questionOptions[random]?.id;
            newResposnes.push(response);
          }

          return newResposnes;
        });
      }

      handleNextIndex();
    },
    [
      setDeckResponse,
      setCurrentQuestionStep,
      currentQuestionStep,
      question,
      handleNextIndex,
      currentOptionSelected,
      optionPercentage,
    ],
  );

  const hasReachedEnd = useMemo(
    () => currentQuestionIndex >= questions.length,
    [currentQuestionIndex],
  );

  useEffect(() => {
    if (hasReachedEnd) {
      saveDeck(deckResponse, deckId);
    }
  }, [hasReachedEnd, deckResponse]);

  useEffect(() => {
    if (questionsRef.current) {
      questionsRef.current.scrollTop = questionsRef.current?.scrollHeight;
    }
  }, [questionsRef.current]);

  if (questions.length === 0 || hasReachedEnd) {
    return <NoQuestionsCard browseHomeUrl={browseHomeUrl} />;
  }

  const questionOffset = 70 * (questions.length - currentQuestionIndex - 1);

  return (
    <div className="flex flex-col justify-between h-full">
      <AnswerHeader questionTags={question.questionTags} />
      <div
        ref={questionsRef}
        className="overflow-y-auto max-h-[calc(100%-30px-100px)]"
      >
        <div
          className="relative"
          style={{ marginBottom: questionOffset + "px" }}
        >
          {Array.from(
            Array(questions.length - (currentQuestionIndex + 1)).keys(),
          ).map((index) => (
            <QuestionCard
              key={index}
              numberOfSteps={NUMBER_OF_STEPS_PER_QUESTION}
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
            numberOfSteps={NUMBER_OF_STEPS_PER_QUESTION}
            question={question.question}
            viewImageSrc={question.imageUrl}
            step={currentQuestionStep}
            onDurationRanOut={handleNoAnswer}
            className="z-50 relative drop-shadow-question-card border-opacity-40"
            style={{
              transform: `translateY(${questionOffset}px)`,
            }}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={question.type}
              step={currentQuestionStep}
              questionOptions={question.questionOptions}
              randomOptionId={question.questionOptions[random]?.id}
              percentage={optionPercentage}
              onPercentageChanged={setOptionPercentage}
            />
          </QuestionCard>
        </div>
      </div>

      <div className="pt-2">
        {rerenderAction && (
          <QuestionAction
            onButtonClick={onQuesitonActionClick}
            type={question.type}
            step={currentQuestionStep}
            questionOptions={question.questionOptions}
            randomQuestionMarker={getAlphaIdentifier(random)}
          />
        )}
      </div>
    </div>
  );
}
