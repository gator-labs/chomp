"use client";
import { SaveQuestionRequest, saveDeck } from "@chomp/app/actions/answer";
import { useRandom } from "@chomp/app/hooks/useRandom";
import { useStopwatch } from "@chomp/app/hooks/useStopwatch";
import { getAlphaIdentifier } from "@chomp/app/utils/question";
import { QuestionTag, QuestionType, Tag } from "@prisma/client";
import dayjs from "dayjs";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import { QuestionStep } from "../Question/Question";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";
import Stepper from "../Stepper/Stepper";
import { getQuestionsDueAt } from "@chomp/app/utils/dateUtils";

export type Option = {
  id: number;
  option: string;
  isLeft: boolean;
};

export type Question = {
  id: number;
  durationMilliseconds: number;
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
  setHasReachedEnd?: Dispatch<SetStateAction<boolean>>;
  deckVariant: "daily-deck" | "regular-deck";
};

export function Deck({
  questions,
  browseHomeUrl,
  deckId,
  setHasReachedEnd,
  deckVariant,
}: DeckProps) {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [dueAt, setDueAt] = useState<Date>(getQuestionsDueAt(questions, 0));
  const [rerenderAction, setRerenderAction] = useState(true);
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
  const { start, reset, getTimePassedSinceStart } = useStopwatch();

  useEffect(() => {
    start();
  }, [start]);

  const handleNextIndex = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getQuestionsDueAt(questions, currentQuestionIndex + 1));
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
    setDeckResponse((prev) => [...prev, { questionId: question.id }]);
    handleNextIndex();
  }, [question, handleNextIndex, setDeckResponse]);

  const onQuestionActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        question.type === "BinaryQuestion"
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
        question.type === "BinaryQuestion"
      ) {
        setDeckResponse((prev) => {
          const newResponses = [...prev];
          const response = newResponses.pop();
          if (response) {
            response.percentageGiven = number ?? 0;
            response.timeToAnswerInMilliseconds = getTimePassedSinceStart();
            newResponses.push(response);
          }

          return newResponses;
        });
      }

      if (
        currentQuestionStep === QuestionStep.PickPercentage &&
        question.type === "MultiChoice"
      ) {
        setDeckResponse((prev) => {
          const newResponses = [...prev];
          const response = newResponses.pop();
          if (response) {
            response.percentageGiven = optionPercentage;
            response.percentageGivenForAnswerId =
              question.questionOptions[random]?.id;
            response.timeToAnswerInMilliseconds = getTimePassedSinceStart();
            newResponses.push(response);
          }

          return newResponses;
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
      setHasReachedEnd?.(true);
      saveDeck(deckResponse, deckId);
    }
  }, [hasReachedEnd, deckResponse]);

  useEffect(() => {
    if (questionsRef.current) {
      questionsRef.current.scrollTop = questionsRef.current?.scrollHeight;
    }
  }, [questionsRef.current]);

  if (questions.length === 0 || hasReachedEnd) {
    return (
      <div className="flex flex-col justify-evenly h-full pb-4">
        <NoQuestionsCard browseHomeUrl={browseHomeUrl} variant={deckVariant} />
      </div>
    );
  }

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
            onDurationRanOut={handleNoAnswer}
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
          randomQuestionMarker={getAlphaIdentifier(random)}
          percentage={optionPercentage}
          setPercentage={setOptionPercentage}
        />
      )}
    </div>
  );
}
