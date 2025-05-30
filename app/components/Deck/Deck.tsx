"use client";

import {
  SaveQuestionRequest,
  answerQuestion,
} from "@/actions/answers/answerQuestion";
import { markQuestionAsSeenButNotAnswered } from "@/actions/answers/markQuestionAsSeenButNotAnswered";
import {
  markQuestionAsSkipped,
  markQuestionAsTimedOut,
} from "@/app/actions/answer";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { useStopwatch } from "@/app/hooks/useStopwatch";
import { getUserTotalCreditAmount } from "@/app/queries/home";
import {
  getAlphaIdentifier,
  getAnsweredQuestionsStatus,
} from "@/app/utils/question";
import { trackAnswerStatus, trackQuestionAnswer } from "@/app/utils/tracking";
import trackEvent from "@/lib/trackEvent";
import { QuestionStep } from "@/types/question";
import { AnswerStatus, QuestionTag, QuestionType, Tag } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import classNames from "classnames";
import dayjs from "dayjs";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BuyCreditsDrawer from "../BuyCreditsDrawer/BuyCreditsDrawer";
import { NoQuestionsCard } from "../NoQuestionsCard/NoQuestionsCard";
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
  deckCost: number | null;
  creditCostFeatureFlag: boolean;
  totalCredits: number;
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
  deckCost,
  creditCostFeatureFlag,
  totalCredits,
}: DeckProps) {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [deckResponse, setDeckResponse] = useState<SaveQuestionRequest[]>([]);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<QuestionStep>(
    QuestionStep.AnswerQuestion,
  );
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    questions.findIndex((q) => q.status === undefined),
  );
  const currentQuestionIndexRef = useRef(currentQuestionIndex);

  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [processingSkipQuestion, setProcessingSkipQuestion] = useState(false);

  const { start, reset, getTimePassedSinceStart } = useStopwatch();
  const [isTimeOutPopUpVisible, setIsTimeOutPopUpVisible] = useState(false);
  const [numberOfAnsweredQuestions, setNumberOfAnsweredQuestions] = useState(0);
  const [isCreditsLow, setIsCreditsLow] = useState(false);
  const [random, setRandom] = useState(0);

  useEffect(() => {
    start();
  }, [start]);

  // Keep ref in sync with state
  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // handle next question
  const handleNextIndex = useCallback(async () => {
    if (creditCostFeatureFlag && deckCost !== null && deckCost > 0) {
      const userCreditBal = await getUserTotalCreditAmount();
      const costPerQuestion = deckCost / questions.length;
      const isLastQuestion =
        currentQuestionIndexRef.current + 1 === questions.length;
      if (userCreditBal < costPerQuestion && !isLastQuestion) {
        setIsCreditsLow(true);
        return;
      }
    }

    // Use functional updates to remove dependencies on current state
    setCurrentQuestionIndex((currentIndex) => {
      const nextIndex = currentIndex + 1;
      
      // Prevent going beyond the last question
      if (nextIndex >= questions.length) {
        return questions.length; // This will trigger hasReachedEnd = true
      }
      
      setDueAt(getDueAt(questions, nextIndex));
      return nextIndex;
    });

    setDeckResponse([]);
    setRandom(0);
    setCurrentQuestionStep(QuestionStep.AnswerQuestion);
    setOptionPercentage(50);
    setCurrentOptionSelected(undefined);

    reset();
    setIsSubmitting(false);
  }, [
    creditCostFeatureFlag,
    deckCost,
    questions,
    // reset should be stable since it's useCallback with stable deps
  ]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  // every time we have a different truthy question.id
  // we mark it as "seen"
  useEffect(() => {
    let aborted = false;

    const markQuestionAsSeen = async () => {
      try {
        // If there's an error marking the question as seen
        // we track the error but don't take any other action
        // Previously, we were going to the next question but due to some other
        // unknown error, this was leading to multiple questions being skipped from the UI.
        const response = await markQuestionAsSeenButNotAnswered(question.id);

        // Check if this effect was aborted (component unmounted or question changed)
        if (aborted) return;

        // NOTICE: if the response comes with an error we just
        // go to the next question and do nothing
        // is this the best way to handle this error?
        if (response?.hasError) {
          Sentry.captureMessage(
            `Error calling markQuestionAsSeenButNotAnswered()`,
            {
              level: "error",
              tags: {
                category: "deck-errors",
              },
              extra: {
                questionId: question.id,
                deckId: deckId,
                deckVariant: deckVariant,
                currentQuestionIndex: currentQuestionIndexRef.current,
              },
            },
          );

          return;
        }

        if (response?.random !== undefined) {
          setRandom(response.random);
        }
      } catch (error) {
        // Only handle error if this effect hasn't been aborted
        if (aborted) return;

        console.error("Error marking question as seen:", error);
        Sentry.captureMessage(
          `Caught exception when calling markQuestionAsSeenButNotAnswered. `,
          {
            level: "error",
            tags: {
              category: "deck-errors",
            },
            extra: {
              questionId: question?.id,
              deckId: deckId,
              deckVariant: deckVariant,
              currentQuestionIndex: currentQuestionIndexRef.current,
              error: error,
            },
          },
        );
      }
    };

    if (question?.id) {
      markQuestionAsSeen();
    }

    // Cleanup function to abort this effect
    return () => {
      aborted = true;
    };
  }, [question?.id]);

  const handleNoAnswer = useCallback(async () => {
    setIsTimeOutPopUpVisible(false);
    handleNextIndex();
  }, [handleNextIndex]);

  const handleOnDurationRanOut = useCallback(async () => {
    if (isSubmitting || !question?.id) return;
    await markQuestionAsTimedOut(question.id);
    setIsTimeOutPopUpVisible(true);
  }, [question?.id, isSubmitting]);

  const handleSkipQuestion = async () => {
    if (processingSkipQuestion || !question?.id) return;
    setProcessingSkipQuestion(true);
    await markQuestionAsSkipped(question.id);
    handleNextIndex();
    setProcessingSkipQuestion(false);
  };

  const onQuestionActionClick = useCallback(
    async (number: number | undefined) => {
      // Guard against undefined question (when deck is completed)
      if (!question?.id) return;
      
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
        trackQuestionAnswer(
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
        trackQuestionAnswer(
          question,
          "SECOND_ORDER",
          deckId,
          deckVariant,
          optionPercentage,
        );
        setDeckResponse((prev) => {
          const newResponses = [...prev];
          const response = newResponses.pop();
          if (response) {
            response.percentageGiven = optionPercentage;
            response.percentageGivenForAnswerId =
              random !== undefined
                ? question.questionOptions[random]?.id
                : undefined;

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

        trackAnswerStatus({ ...deckResponse[0], deckId }, "SUCCEEDED");
      } catch {
        trackAnswerStatus({ ...deckResponse[0], deckId }, "FAILED");
      }

      handleNextIndex();
    },
    [
      setDeckResponse,
      setCurrentQuestionStep,
      currentQuestionStep,
      question,
      currentOptionSelected,
      optionPercentage,
      random,
      handleNextIndex,
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
      trackQuestionAnswer(question, "QUESTION_LOADED", deckId, deckVariant);
    }
  }, [question]);

  useEffect(() => {
    if (
      questions.length === 0 ||
      hasReachedEnd ||
      currentQuestionIndex === -1
    ) {
      trackEvent(TRACKING_EVENTS.DECK_COMPLETED, {
        [TRACKING_METADATA.DECK_ID]: deckId,
        [TRACKING_METADATA.IS_DAILY_DECK]: deckVariant === "daily-deck",
        [TRACKING_METADATA.SOURCE]: pathname.endsWith("answer")
          ? TRACKING_METADATA.ANSWER_TAB
          : "",
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
          deckRevealAtDate={questions[0]?.deckRevealAtDate}
        />
      </div>
    );
  }
  
  // Guard against undefined question (edge case during state transitions)
  if (!question) {
    return (
      <div className="flex flex-col justify-evenly h-full pb-4">
        <NoQuestionsCard
          variant={deckVariant || "regular-deck"}
          nextDeckId={nextDeckId}
        />
      </div>
    );
  }
  
  // get random option for 2nd order question.
  const randomQuestionMarker =
    random === undefined
      ? undefined
      : question?.type === QuestionType.MultiChoice
        ? getAlphaIdentifier(random)
        : question?.questionOptions?.[random]?.option;

  return (
    <div className="flex flex-col justify-start h-full pb-4 w-full">
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
            isTimerPaused={isSubmitting}
          >
            <QuestionCardContent
              optionSelectedId={currentOptionSelected}
              onOptionSelected={setCurrentOptionSelected}
              type={question.type}
              step={currentQuestionStep}
              questionOptions={question.questionOptions}
              randomOptionId={
                random !== undefined
                  ? question.questionOptions[random]?.id
                  : undefined
              }
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
      />
      {currentQuestionStep !== QuestionStep.PickPercentage && (
        <div
          className={classNames(
            "text-sm text-center mt-5 text-gray-400 underline ",
            processingSkipQuestion ? "cursor-not-allowed" : "cursor-pointer",
          )}
          onClick={() => handleSkipQuestion()}
        >
          Skip question
        </div>
      )}

      <BuyCreditsDrawer
        isOpen={isCreditsLow}
        onClose={() => setIsCreditsLow(false)}
        creditsToBuy={deckCost ? deckCost - totalCredits : 0}
      />

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
