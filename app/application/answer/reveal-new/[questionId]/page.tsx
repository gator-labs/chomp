"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import InfoDrawer from "@/app/components/InfoDrawer/InfoDrawer";
import { getAlphaIdentifier } from "@/app/utils/question";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
import QuestionPreviewCard from "@/components/QuestionPreviewCard/QuestionPreviewCard";
import SecondOrderAnswerResultsMultiple from "@/components/SecondOrderAnswerResultMultiple";
import SecondOrderAnswerResultsBinary from "@/components/SecondOrderAnswerResultsBinary";
import { useGetAnswerStatsQuery } from "@/hooks/useGetAnswerStatsQuery";
import { QuestionType } from "@prisma/client";
import { notFound } from "next/navigation";
import { useState } from "react";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPageNew = ({ params }: Props) => {
  const [isSecOrdAnsInfDrawerOpen, setIsSecOrdAnsInfDrawerOpen] = useState(false);

  const handleSecOrdAnsInfDrawerClose = () => {
    setIsSecOrdAnsInfDrawerOpen(false);
  }

  const openSecOrdAnsInfDrawer = () => {
    setIsSecOrdAnsInfDrawerOpen(true);
  }

  const questionId =
    params.questionId === undefined ? undefined : Number(params.questionId);

  const result = useGetAnswerStatsQuery(questionId);

  const loadingScreen = (
    <ChompFullScreenLoader
      isLoading={true}
      loadingMessage="Loading question stats..."
    />
  );

  // Parameters can be undefined on the first render;
  // return a promise to trigger suspense further up
  // the tree until we have the values.
  if (params.questionId === undefined) return loadingScreen;

  if (result.isError) {
    if (result.error.name === "NotFoundError") notFound();
    else
      return (
        <div className="p-10 w-full flex justify-center">
          Error fetching question.
        </div>
      );
  }

  if (result.isLoading || !result.data) return loadingScreen;

  const stats = result.data.stats;

  const isBinary = stats.type === QuestionType.BinaryQuestion;

  const answerSelected = stats.userAnswers.find((ua) => ua.selected);

  let answerContent = <></>;

  if (!!isBinary) {
    answerContent = (
      <>
        <BinaryBestAnswer
          questionOptions={stats.questionOptions}
          optionSelected={answerSelected?.questionOption?.option ?? null}
          bestOption={stats.correctAnswer?.option ?? ""}
        />
      </>
    );
  }
  if (!isBinary) {
    answerContent = (
      <>
        <MultiChoiceBestAnswer
          questionOptions={stats.questionOptions}
          optionSelected={answerSelected?.questionOption?.option ?? null}
          bestOption={stats.correctAnswer?.option ?? ""}
        />
      </>
    );
  }

  let secondOrderAnswerResults = <></>;

  if (isBinary) {
    // Second Order Binary Choice Question Answers

    const leftQuestionOptionP = stats.questionOptionPercentages.find(
      (q) => q.isLeft,
    );
    const rightQuestionOptionP = stats.questionOptionPercentages.find(
      (q) => !q.isLeft,
    );

    const selectedAnswer = stats.userAnswers.find((ans) => ans.selected);
    const selectedPercentage = Number(selectedAnswer?.percentage);

    // if secondOrderAveragePercentagePicked is null we take it as 0
    // TODO: Move to server?
    const aPercentage =
      leftQuestionOptionP?.secondOrderAveragePercentagePicked || 0;
    const bPercentage =
      rightQuestionOptionP?.secondOrderAveragePercentagePicked || 0;

    secondOrderAnswerResults = SecondOrderAnswerResultsBinary({
      aPercentage,
      bPercentage,
      isSelectedCorrectNullIfNotOpened: stats.isSecondOrderCorrect,
      selectedPercentage,
      openSecOrdAnsInfDrawer,
    });
  } else {
    // Second Order Multiple Choice Question Answers

    // only one Second order Answer is selected by the user,
    // this second order answer will have a percentage number from 0 to 100
    // this tell us that this was the answer selected by the user for this Question
    const selectedAnswer = stats.userAnswers.find(
      (ans) => ans.percentage != null,
    );
    const selectedQOId = selectedAnswer?.questionOptionId || null;
    const selectedPercentage = Number(selectedAnswer?.percentage);

    const options = stats.questionOptionPercentages.map(
      (qop, index) =>
        ({
          isSelected: qop.id === selectedQOId,
          text: qop.option,
          label: getAlphaIdentifier(index),
          percentage: qop.secondOrderAveragePercentagePicked,
        }) as SecondOrderOptionResultMultiple,
    );

    secondOrderAnswerResults = SecondOrderAnswerResultsMultiple({
      options,
      isSelectedCorrect: stats.isSecondOrderCorrect,
      selectedPercentage,
      openSecOrdAnsInfDrawer,
    });
  }

  return (
    <div>
      <AnswerStatsHeader
        title={stats.question}
        deckId={stats.deckQuestions?.[0]?.deckId ?? null}
        isCorrect={stats.isFirstOrderCorrect}
        isPracticeQuestion={stats.isPracticeQuestion}
        bonkReward={stats.QuestionRewards?.[0]?.bonkReward ?? "0"}
        creditsReward={stats.QuestionRewards?.[0]?.creditsReward ?? "0"}
        rewardStatus={stats.rewardStatus}
      />
      <QuestionPreviewCard
        question={stats.question}
        revealAtDate={stats.revealAtDate}
        imageUrl={stats.imageUrl}
      />
      {answerContent}
      {secondOrderAnswerResults}

      <InfoDrawer isOpen={isSecOrdAnsInfDrawerOpen} onClose={handleSecOrdAnsInfDrawerClose} title="Your second order answer">
        <div className="text-sm mb-6 space-y-4">
          <p>
            The second order answer represent what a player predicted OTHERS would guess.
          </p>
          <p>
            We take the average of each user’s prediction to generate this result. Mathematically this won’t always add up to 100%!
          </p>
        </div>
      </InfoDrawer>

    </div>
  );
};

type SecondOrderOptionResultMultiple = {
  isSelected: boolean;
  text: string;
  label: string;
  percentage: number;
};

export type SecondOrderOptionResultsMultiple =
  SecondOrderOptionResultMultiple[];

export default RevealAnswerPageNew;
