"use client";
import { SaveQuestionRequest, saveDeck } from "@/app/actions/answer";
import { useRandom } from "@/app/hooks/useRandom";
import { useStopwatch } from "@/app/hooks/useStopwatch";
import { markQuestionAnswersAsViewed } from "@/app/queries/deck";
import { getAlphaIdentifier } from "@/app/utils/question";
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
  setHasReachedEnd?: Dispatch<SetStateAction<boolean>>;
  deckVariant: "daily-deck" | "regular-deck";
};

const getDueAt = (questions: Question[], index: number): Date => {
  if (!questions[index]) {
    return new Date();
  }
  return dayjs(new Date())
    .add(questions[index].durationMiliseconds, "milliseconds")
    .toDate();
};

export const Deck = ({
  questions,
  browseHomeUrl,
  deckId,
  setHasReachedEnd,
  deckVariant,
}: DeckProps) => {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestionStep, setCurrentQuestionStep] = useState<QuestionStep>(
    QuestionStep.AnswerQuestion,
  );
  const [dueAt, setDueAt] = useState<Date>(getDueAt(questions, 0));
  const [deckResponse, setDeckResponse] = useState<SaveQuestionRequest[]>([]);
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const [showModal, setShowModal] = useState(false);
  const [showMissedMessage, setShowMissedMessage] = useState<
    "some" | "all" | null
  >(null);
  const [isEndHandled, setIsEndHandled] = useState(false);

  const { random, generateRandom } = useRandom({
    min: 0,
    max: questions[currentQuestionIndex]?.questionOptions.length - 1 || 0,
  });

  const { start, reset, getTimePassedSinceStart } = useStopwatch();

  useEffect(() => {
    start();
  }, [start]);

  const question = useMemo(
    () => questions[currentQuestionIndex],
    [questions, currentQuestionIndex],
  );

  const scrollToBottom = () => {
    setTimeout(() => {
      questionsRef.current?.scrollTo({
        top: questionsRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 200);
  };

  const handleNextIndex = useCallback(() => {
    if (currentQuestionIndex + 1 < questions.length) {
      setDueAt(getDueAt(questions, currentQuestionIndex + 1));
      setCurrentQuestionIndex((index) => index + 1);
      setCurrentQuestionStep(QuestionStep.AnswerQuestion);
      setCurrentOptionSelected(undefined);
      setOptionPercentage(50);
      generateRandom();
      reset();
      scrollToBottom();
    } else {
      setIsEndHandled(true);
    }
  }, [currentQuestionIndex, questions, generateRandom, reset]);

  const handleNoAnswer = async () => {
    await markQuestionAnswersAsViewed(deckId);
    setShowModal(true);
  };

  const confirmContinue = () => {
    setDeckResponse((prev) => [...prev, { questionId: question.id }]);
    setShowModal(false);
    handleNextIndex();
  };

  const handleQuestionAction = useCallback(
    (number?: number) => {
      if (currentQuestionStep === QuestionStep.AnswerQuestion) {
        handleFirstStepAnswer(number);
      } else if (currentQuestionStep === QuestionStep.PickPercentage) {
        handleSecondStepAnswer(number);
      }
    },
    [currentQuestionStep, question, handleNextIndex],
  );

  const handleFirstStepAnswer = (number?: number) => {
    if (question.type === "BinaryQuestion" && number !== undefined) {
      setDeckResponse((prev) => [
        ...prev,
        { questionId: question.id, questionOptionId: number },
      ]);
      setCurrentQuestionStep(QuestionStep.PickPercentage);
    } else if (
      question.type === "MultiChoice" &&
      currentOptionSelected !== undefined
    ) {
      setDeckResponse((prev) => [
        ...prev,
        { questionId: question.id, questionOptionId: currentOptionSelected },
      ]);
      setCurrentQuestionStep(QuestionStep.PickPercentage);
    }
  };

  const handleSecondStepAnswer = (number?: number) => {
    setDeckResponse((prev) => {
      const newResponses = [...prev];
      const response = newResponses.pop();
      if (response) {
        response.percentageGiven = optionPercentage;
        response.timeToAnswerInMiliseconds = getTimePassedSinceStart();
        if (question.type === "MultiChoice") {
          response.percentageGivenForAnswerId =
            question.questionOptions[random]?.id;
        } else if (question.type === "BinaryQuestion" && number !== undefined) {
          response.percentageGiven = number;
        }
        newResponses.push(response);
      }
      return newResponses;
    });
    handleNextIndex();
  };

  useEffect(() => {
    if (isEndHandled) {
      const unansweredCount = questions.filter((q) =>
        deckResponse.every(
          (response) =>
            response.questionId !== q.id || !response.questionOptionId,
        ),
      ).length;

      if (unansweredCount === questions.length) {
        setShowMissedMessage("all");
      } else if (unansweredCount > 0) {
        setShowMissedMessage("some");
      } else {
        saveDeck(deckResponse, deckId);
      }

      if (setHasReachedEnd) {
        setHasReachedEnd(true);
      }
    }
  }, [isEndHandled, questions, deckResponse, deckId, setHasReachedEnd]);

  if (!questions.length) {
    return (
      <div className="flex flex-col justify-evenly h-full pb-4">
        <NoQuestionsCard browseHomeUrl={browseHomeUrl} variant={deckVariant} />
      </div>
    );
  }

  if (showMissedMessage) {
    return (
      <NoQuestionsCard
        variant={showMissedMessage === "all" ? "missed-all" : "missed-some"}
        browseHomeUrl={browseHomeUrl}
      />
    );
  }

  if (isEndHandled && !showMissedMessage) {
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

      <QuestionAction
        onButtonClick={handleQuestionAction}
        type={question.type}
        step={currentQuestionStep}
        questionOptions={question.questionOptions}
        randomQuestionMarker={getAlphaIdentifier(random)}
        percentage={optionPercentage}
        setPercentage={setOptionPercentage}
        disabled={showModal}
      />

      <Sheet
        isOpen={showModal}
        setIsOpen={setShowModal}
        closIconWidth={24}
        closIconHeight={24}
        disableClose={true}
      >
        <div className="p-4 text-center flex flex-col gap-6">
          <h3 className="text-base font-bold leading-[20.16px] text-left text-purple">
            Are you still there?
          </h3>
          <p className="text-[13px] font-light leading-[16.38px] text-left">
            Your time&apos;s up! To prevent you from missing out on the next
            question, click proceed to continue.
          </p>
          <Button
            onClick={confirmContinue}
            variant="white"
            className="!rounded-[32px]"
          >
            Proceed
          </Button>
        </div>
      </Sheet>
    </div>
  );
};

export default Deck;
