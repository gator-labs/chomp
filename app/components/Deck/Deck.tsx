"use client";
import { SaveQuestionRequest, saveDeck } from "@/app/actions/answer";
import { useRandom } from "@/app/hooks/useRandom";
import { useStopwatch } from "@/app/hooks/useStopwatch";
import {
  getAlphaIdentifier,
  getAnsweredQuestionsStatus,
} from "@/app/utils/question";
import { QuestionTag, QuestionType, Tag } from "@prisma/client";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../Button/Button";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import { QuestionStep } from "../Question/Question";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";
import Sheet from "../Sheet/Sheet";
import Stepper from "../Stepper/Stepper";

export type Option = {
  id: number;
  option: string;
  isLeft: boolean;
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
  deckVariant?: "daily-deck" | "regular-deck";
};

const getDueAt = (questions: Question[], index: number): Date => {
  return dayjs(new Date())
    .add(questions[index].durationMiliseconds, "milliseconds")
    .toDate();
};

export function Deck({
  questions,
  browseHomeUrl,
  deckId,
  deckVariant,
}: DeckProps) {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [rerenderAction, setRerenderAction] = useState(true);
  const [deckResponse, setDeckResponse] = useState<SaveQuestionRequest[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<QuestionStep>(
    QuestionStep.AnswerQuestion,
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const { random, generateRandom, setRandom } = useRandom({
    min: 0,
    max:
      questions[currentQuestionIndex] &&
      questions[currentQuestionIndex].questionOptions.length > 0
        ? questions[currentQuestionIndex].questionOptions.length - 1
        : 0,
  });
  const { start, reset, getTimePassedSinceStart } = useStopwatch();
  const [isTimeOutPopUpVisible, setIsTimeOutPopUpVisible] = useState(false);
  const [numberOfAnsweredQuestions, setNumberOfAnsweredQuestions] = useState(0);

  useEffect(() => {
    start();
  }, [start]);

  const handleNextIndex = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getDueAt(questions, currentQuestionIndex + 1));
    }
    setCurrentQuestionIndex((index) => index + 1);
    setCurrentQuestionStep(QuestionStep.AnswerQuestion);
    setRerenderAction(false);
    setOptionPercentage(50);
    setCurrentOptionSelected(undefined);
    generateRandom();
    reset();
    setTimeout(() => {
      setRerenderAction(true);
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
    setRerenderAction,
    generateRandom,
    setCurrentOptionSelected,
    reset,
    questionsRef.current,
  ]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  const handleNoAnswer = useCallback(() => {
    setIsTimeOutPopUpVisible(false);
    setDeckResponse((prev) => [...prev, { questionId: question.id }]);
    handleNextIndex();
  }, [question, handleNextIndex, setDeckResponse]);

  const onQuestionActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        question.type === "BinaryQuestion"
      ) {
        setRandom(
          question.questionOptions.findIndex((option) => option.id === number),
        );
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

      if (currentQuestionStep === QuestionStep.PickPercentage) {
        setDeckResponse((prev) => {
          const newResponses = [...prev];
          const response = newResponses.pop();
          if (response) {
            response.percentageGiven = optionPercentage;
            response.percentageGivenForAnswerId =
              question.questionOptions[random]?.id;
            response.timeToAnswerInMiliseconds = getTimePassedSinceStart();
            newResponses.push(response);
          }

          return newResponses;
        });
      }
      setNumberOfAnsweredQuestions((prev) => prev + 1);

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
    const percentOfAnsweredQuestions =
      (numberOfAnsweredQuestions / questions.length) * 100;

    const variant = getAnsweredQuestionsStatus(percentOfAnsweredQuestions);

    return (
      <div className="flex flex-col justify-evenly h-full pb-4">
        <NoQuestionsCard
          browseHomeUrl={browseHomeUrl}
          variant={deckVariant || variant}
        />
      </div>
    );
  }

  const randomQuestionMarker =
    question.type === QuestionType.MultiChoice
      ? getAlphaIdentifier(random)
      : question.questionOptions[random].option;

  return (
    <div className="flex flex-col justify-start h-full pb-4">
      <Stepper
        numberOfSteps={questions.length}
        activeStep={currentQuestionIndex}
        color="green"
        className="!p-0 mb-5"
      />
      <div ref={questionsRef} className="mb-4 h-full">
        <div className="relative h-full">
          <QuestionCard
            dueAt={dueAt}
            question={question.question}
            type={question.type}
            viewImageSrc={question.imageUrl}
            onDurationRanOut={() => setIsTimeOutPopUpVisible(true)}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={question.type}
              step={currentQuestionStep}
              questionOptions={question.questionOptions}
              randomOptionId={question.questionOptions[random]?.id}
              percentage={optionPercentage}
            />
          </QuestionCard>
        </div>
      </div>

      {rerenderAction && (
        <QuestionAction
          onButtonClick={onQuestionActionClick}
          type={question.type}
          step={currentQuestionStep}
          questionOptions={question.questionOptions}
          randomQuestionMarker={randomQuestionMarker}
          percentage={optionPercentage}
          setPercentage={setOptionPercentage}
        />
      )}

      <Sheet
        disableClose
        isOpen={isTimeOutPopUpVisible}
        setIsOpen={setIsTimeOutPopUpVisible}
        closeIconHeight={16}
        closeIconWidth={16}
      >
        <div className="p-6 pt-2 flex flex-col gap-6">
          <p className="text-base text-purple font-bold">
            Are you still there?
          </p>
          <p className="text-sm text-white">
            Your time&apos;s up! To prevent you from missing out on the next
            question, click proceed to continue.
          </p>
          <Button
            variant="white"
            isPill
            className="!h-10"
            onClick={handleNoAnswer}
          >
            Proceed
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
