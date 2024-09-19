"use client";
import {
  answerQuestion,
  markQuestionAsSeenButNotAnswered,
  markQuestionAsSkipped,
  markQuestionAsTimedOut,
  SaveQuestionRequest,
} from "@/app/actions/answer";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "@/app/constants/mixpanel";
import { useRandom } from "@/app/hooks/useRandom";
import { useStopwatch } from "@/app/hooks/useStopwatch";
import {
  sendAnswerStatusToMixpanel,
  sendAnswerToMixpanel,
} from "@/app/utils/mixpanel";
import {
  getAlphaIdentifier,
  getAnsweredQuestionsStatus,
} from "@/app/utils/question";
import sendToMixpanel from "@/lib/mixpanel";
import { AnswerStatus, QuestionTag, QuestionType, Tag } from "@prisma/client";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
import { QuestionStep } from "../Question/Question";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";
import Stepper from "../Stepper/Stepper";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";

export type Option = {
  id: number;
  option: string;
  isLeft: boolean;
};

export type Question = {
  deckRevealAtDate?: Date | null;
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  imageUrl?: string;
  questionOptions: Option[];
  questionTags: (QuestionTag & { tag: Tag })[];
  status?: AnswerStatus;
  createdAt?: Date;
};

type DeckProps = {
  questions: Question[];
  deckId: number;
  nextDeckId?: number;
  deckVariant?: "daily-deck" | "regular-deck";
};

const getDueAt = (questions: Question[], index: number): Date => {
  return dayjs(new Date())
    .add(questions[index].durationMiliseconds, "milliseconds")
    .toDate();
};

export function Deck({
  questions,
  nextDeckId,
  deckVariant,
  deckId,
}: DeckProps) {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [deckResponse, setDeckResponse] = useState<SaveQuestionRequest[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<QuestionStep>(
    QuestionStep.AnswerQuestion,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    questions.findIndex((q) => q.status === undefined),
  );

  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const min = 0;
  const max =
    !!questions[currentQuestionIndex] &&
    questions[currentQuestionIndex].questionOptions.length > 0
      ? questions[currentQuestionIndex].questionOptions.length - 1
      : 0;

  const { random, generateRandom, setRandom } = useRandom({
    min,
    max,
  });
  const { start, reset, getTimePassedSinceStart } = useStopwatch();
  const [isTimeOutPopUpVisible, setIsTimeOutPopUpVisible] = useState(false);
  const [numberOfAnsweredQuestions, setNumberOfAnsweredQuestions] = useState(0);

  useEffect(() => {
    start();
  }, [start]);

  const handleNextIndex = useCallback(async () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getDueAt(questions, currentQuestionIndex + 1));
    }
    setDeckResponse([]);
    setCurrentQuestionIndex((index) => index + 1);
    setCurrentQuestionStep(QuestionStep.AnswerQuestion);
    setOptionPercentage(50);
    setCurrentOptionSelected(undefined);
    const min = 0;
    const max =
      !!questions[currentQuestionIndex + 1] &&
      questions[currentQuestionIndex + 1].questionOptions.length > 0
        ? questions[currentQuestionIndex + 1].questionOptions.length - 1
        : 0;
    generateRandom({ min, max });
    reset();
    setIsSubmitting(false);
  }, [
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setCurrentQuestionStep,
    generateRandom,
    setCurrentOptionSelected,
    reset,
    questions,
  ]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  useEffect(() => {
    const run = async () => {
      const res = await markQuestionAsSeenButNotAnswered(question.id);
      if (!!res?.hasError) {
        handleNextIndex();
        return;
      }
    };

    if (!!question?.id) run();
  }, [question?.id]);

  const handleNoAnswer = useCallback(async () => {
    setIsTimeOutPopUpVisible(false);
    handleNextIndex();
  }, [question, handleNextIndex, setDeckResponse]);

  const handleOnDurationRanOut = useCallback(async () => {
    await markQuestionAsTimedOut(question.id);
    setIsTimeOutPopUpVisible(true);
  }, [question, handleNextIndex, setDeckResponse]);

  const handleSkipQuestion = async () => {
    await markQuestionAsSkipped(question.id);
    handleNextIndex();
  };

  const onQuestionActionClick = useCallback(
    async (number: number | undefined) => {
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
        sendAnswerToMixpanel(
          question,
          "FIRST_ORDER",
          deckId,
          deckVariant,
          question.questionOptions.find((option) => option.id === number)
            ?.option,
        );
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

      setIsSubmitting(true);

      try {
        await answerQuestion({ ...deckResponse[0], deckId });
        sendAnswerStatusToMixpanel({ ...deckResponse[0], deckId }, "SUCCEEDED");
      } catch (error) {
        sendAnswerStatusToMixpanel({ ...deckResponse[0], deckId }, "FAILED");
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
    if (questionsRef.current) {
      questionsRef.current.scrollTop = questionsRef.current?.scrollHeight;
    }
  }, [questionsRef.current]);

  useEffect(() => {
    if (question) {
      sendAnswerToMixpanel(question, "QUESTION_LOADED", deckId, deckVariant);
    }
  }, [question]);

  useEffect(() => {
    if (
      questions.length === 0 ||
      hasReachedEnd ||
      currentQuestionIndex === -1
    ) {
      sendToMixpanel(MIX_PANEL_EVENTS.DECK_COMPLETED, {
        [MIX_PANEL_METADATA.DECK_ID]: deckId,
        [MIX_PANEL_METADATA.IS_DAILY_DECK]: deckVariant === "daily-deck",
      });
    }
  }, [questions.length, hasReachedEnd, currentQuestionIndex]);

  if (questions.length === 0 || hasReachedEnd || currentQuestionIndex === -1) {
    const percentOfAnsweredQuestions =
      (numberOfAnsweredQuestions / questions.length) * 100;

    const variant = getAnsweredQuestionsStatus(percentOfAnsweredQuestions);

    return (
      <div className="flex flex-col justify-evenly h-full pb-4">
        <NoQuestionsCard
          variant={deckVariant || variant}
          nextDeckId={nextDeckId}
          deckRevealAtDate={questions[0].deckRevealAtDate}
        />
      </div>
    );
  }

  // get random option for 2nd order question.
  const randomQuestionMarker =
    question?.type === QuestionType.MultiChoice
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
            onDurationRanOut={handleOnDurationRanOut}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={question.type}
              step={currentQuestionStep}
              questionOptions={question.questionOptions}
              randomOptionId={question.questionOptions[random]?.id}
              percentage={optionPercentage}
              question={question}
            />
          </QuestionCard>
        </div>
      </div>

      <QuestionAction
        onButtonClick={onQuestionActionClick}
        type={question.type}
        step={currentQuestionStep}
        questionOptions={question.questionOptions}
        randomQuestionMarker={randomQuestionMarker}
        percentage={optionPercentage}
        setPercentage={setOptionPercentage}
        disabled={isSubmitting}
        question={question}
        deckId={deckId}
        deckVariant={deckVariant || ""}
      />
      {currentQuestionStep !== QuestionStep.PickPercentage && (
        <div
          className="text-sm text-center mt-5 text-gray-400 underline cursor-pointer"
          onClick={() => handleSkipQuestion()}
        >
          Skip question
        </div>
      )}

      <AlertDialog open={isTimeOutPopUpVisible}>
        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you still there?</AlertDialogTitle>
            <AlertDialogDescription>
              Your time&apos;s up! To prevent you from missing out on the next
              question, click proceed to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Button onClick={handleNoAnswer}>Proceed</Button>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
