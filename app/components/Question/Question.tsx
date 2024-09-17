"use client";
import { saveQuestion, SaveQuestionRequest } from "@/app/actions/answer";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "@/app/constants/mixpanel";
import { useRandom } from "@/app/hooks/useRandom";
import { useStopwatch } from "@/app/hooks/useStopwatch";
import { getAlphaIdentifier } from "@/app/utils/question";
import sendToMixpanel from "@/lib/mixpanel";
import { QuestionTag, QuestionType, Tag } from "@prisma/client";
import dayjs from "dayjs";
import { useRouter } from "next-nprogress-bar";
import { useCallback, useEffect, useState } from "react";
import { AnswerHeader } from "../AnswerHeader/AnswerHeader";
import { QuestionAction } from "../QuestionAction/QuestionAction";
import { QuestionCard } from "../QuestionCard/QuestionCard";
import { QuestionCardContent } from "../QuestionCardContent/QuestionCardContent";

export enum QuestionStep {
  AnswerQuestion = 1,
  PickPercentage = 2,
}

type Option = {
  id: number;
  option: string;
  isLeft: boolean;
};

type Question = {
  id: number;
  durationMiliseconds: number;
  question: string;
  type: QuestionType;
  imageUrl?: string;
  questionOptions: Option[];
  questionTags: (QuestionTag & { tag: Tag })[];
};

type QuestionProps = {
  question: Question;
  returnUrl: string;
  user: {
    id: string;
    username: string;
    address: string;
  };
};

const getDueAt = (durationMiliseconds: number): Date => {
  return dayjs(new Date()).add(durationMiliseconds, "milliseconds").toDate();
};

export function Question({ question, returnUrl, user }: QuestionProps) {
  const router = useRouter();
  const [answerState, setAnswerState] = useState<SaveQuestionRequest>(
    {} as SaveQuestionRequest,
  );
  const [currentOptionSelected, setCurrentOptionSelected] = useState<number>();
  const [optionPercentage, setOptionPercentage] = useState(50);
  const { random, setRandom } = useRandom({
    min: 0,
    max:
      question.questionOptions.length > 0
        ? question.questionOptions.length - 1
        : 0,
  });
  const [currentQuestionStep, setCurrentQuestionStep] = useState<
    QuestionStep | undefined
  >(QuestionStep.AnswerQuestion);
  const { start, getTimePassedSinceStart } = useStopwatch();

  useEffect(() => {
    if (!currentQuestionStep) {
      router.replace(returnUrl);
      router.refresh();
    }
  }, [currentQuestionStep]);

  useEffect(() => {
    start();
  }, []);

  const handleSaveQuestion = useCallback(
    (answer: SaveQuestionRequest | undefined = undefined) => {
      setCurrentQuestionStep(undefined);
      saveQuestion(answer ?? answerState);
    },
    [setCurrentQuestionStep, answerState],
  );

  const onQuestionActionClick = useCallback(
    (number: number | undefined) => {
      if (
        currentQuestionStep === QuestionStep.AnswerQuestion &&
        question.type === "BinaryQuestion"
      ) {
        setRandom(
          question.questionOptions.findIndex((option) => option.id === number),
        );
        setAnswerState({ questionId: question.id, questionOptionId: number });
        sendToMixpanel(MIX_PANEL_EVENTS.FIRST_ORDER_SELECTED, {
          [MIX_PANEL_METADATA.QUESTION_ID]: question.id,
          [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]:
            question.questionOptions,
          [MIX_PANEL_METADATA.QUESTION_TEXT]: question.question,
          [MIX_PANEL_METADATA.QUESTION_HAS_IMAGE]: !!question.imageUrl,
          [MIX_PANEL_METADATA.USER_ID]: user.id,
          [MIX_PANEL_METADATA.USERNAME]: user.username,
          [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: user.address,
        });
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
        sendToMixpanel(MIX_PANEL_EVENTS.FIRST_ORDER_SELECTED, {
          [MIX_PANEL_METADATA.QUESTION_ID]: question.id,
          [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]:
            question.questionOptions,
          [MIX_PANEL_METADATA.QUESTION_TEXT]: question.question,
          [MIX_PANEL_METADATA.QUESTION_HAS_IMAGE]: !!question.imageUrl,
          [MIX_PANEL_METADATA.USER_ID]: user.id,
          [MIX_PANEL_METADATA.USERNAME]: user.username,
          [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: user.address,
        });
        setCurrentQuestionStep(QuestionStep.PickPercentage);

        return;
      }

      if (currentQuestionStep === QuestionStep.PickPercentage) {
        sendToMixpanel(MIX_PANEL_EVENTS.SECOND_ORDER_SELECTED, {
          [MIX_PANEL_METADATA.QUESTION_ID]: question.id,
          [MIX_PANEL_METADATA.QUESTION_ANSWER_OPTIONS]:
            question.questionOptions,
          [MIX_PANEL_METADATA.QUESTION_TEXT]: question.question,
          [MIX_PANEL_METADATA.QUESTION_HAS_IMAGE]: !!question.imageUrl,
          [MIX_PANEL_METADATA.USER_ID]: user.id,
          [MIX_PANEL_METADATA.USERNAME]: user.username,
          [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: user.address,
        });
        handleSaveQuestion({
          ...answerState,
          percentageGiven: optionPercentage,
          percentageGivenForAnswerId: question.questionOptions[random]?.id,
          timeToAnswerInMiliseconds: getTimePassedSinceStart(),
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
    ],
  );

  const randomQuestionMarker =
    question.type === QuestionType.MultiChoice
      ? getAlphaIdentifier(random)
      : question.questionOptions[random].option;

  return (
    <div className="flex flex-col justify-between h-full">
      <AnswerHeader questionTags={question.questionTags} />

      <QuestionCard
        dueAt={getDueAt(question.durationMiliseconds)}
        question={question.question}
        type={question.type}
        viewImageSrc={question.imageUrl}
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
        />
      </QuestionCard>

      <div className="pt-2 pb-[53px]">
        <QuestionAction
          onButtonClick={onQuestionActionClick}
          type={question.type}
          step={currentQuestionStep || QuestionStep.PickPercentage}
          questionOptions={question.questionOptions}
          randomQuestionMarker={randomQuestionMarker}
          percentage={optionPercentage}
          setPercentage={setOptionPercentage}
        />
      </div>
    </div>
  );
}
