"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import InfoDrawer from "@/app/components/InfoDrawer/InfoDrawer";
import { getAlphaIdentifier } from "@/app/utils/question";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import BinaryPieChart from "@/components/BinaryPieChart/BinaryPieChart";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
import MultiChoicePieChart from "@/components/MultiChoicePieChart/MultiChoicePieChart";
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
  const FF_NEW_ANSWER_PAGE =
    process.env.NEXT_PUBLIC_FF_NEW_ANSWER_PAGE === "true";

  if (!FF_NEW_ANSWER_PAGE) notFound();

  const [isSecOrdAnsInfoDrawerOpen, setIsSecOrdAnsInfoDrawerOpen] =
    useState(false);

  const handleSecOrdAnsInfoDrawerClose = () => {
    setIsSecOrdAnsInfoDrawerOpen(false);
  };

  const openSecOrdAnsInfDrawer = () => {
    setIsSecOrdAnsInfoDrawerOpen(true);
  };

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

  console.log(stats);

  const isBinary = stats.type === QuestionType.BinaryQuestion;

  const answerSelected = stats.userAnswers.find((ua) => ua.selected);

  const answerContent = !!isBinary ? (
    <>
      <BinaryBestAnswer
        questionOptions={stats.questionOptions}
        optionSelected={answerSelected?.questionOption?.option ?? null}
        bestOption={stats.correctAnswer?.option ?? ""}
      />
      <BinaryPieChart
        questionOptions={stats.questionOptions}
        optionSelected={answerSelected?.questionOption?.option ?? null}
        bestOption={stats.correctAnswer?.option ?? ""}
        totalAnswers={stats.questionAnswerCount}
        correctAnswers={stats.correctAnswersCount}
      />
    </>
  ) : (
    <>
      <MultiChoiceBestAnswer
        questionOptions={stats.questionOptions}
        optionSelected={answerSelected?.questionOption?.option ?? null}
        bestOption={stats.correctAnswer?.option ?? ""}
      />
      <MultiChoicePieChart
        optionSelected={answerSelected?.questionOption?.option ?? null}
        bestOption={stats.correctAnswer?.option ?? ""}
        totalAnswers={stats.questionAnswerCount}
        correctAnswers={stats.correctAnswersCount}
        selectionDistribution={stats.selectionDistribution}
      />
    </>
  );

  let secondOrderAnswerResults = <></>;

  if (isBinary) {
    // Second Order Binary Choice Question Answers

    const questionOpntionPercentageA = stats.questionOptionPercentages.find(
      (q) => q.option === "A",
    );
    const questionOptionPercentageB = stats.questionOptionPercentages.find(
      (q) => q.option === "B",
    );

    const selectedAnswer = stats.userAnswers.find((ans) => ans.selected);
    const selectedPercentage = selectedAnswer?.percentage ?? null;

    // if secondOrderAveragePercentagePicked is null we take it as 0
    const aPercentage =
      questionOpntionPercentageA?.secondOrderAveragePercentagePicked || 0;
    const bPercentage =
      questionOptionPercentageB?.secondOrderAveragePercentagePicked || 0;

    secondOrderAnswerResults = SecondOrderAnswerResultsBinary({
      aPercentage,
      bPercentage,
      isSelectedCorrectNullIfNotOpened: stats.isSecondOrderCorrect,
      selectedPercentage,
      openSecOrdAnsInfDrawer,
    });
  } else {
    // Second Order Multiple Choice Question Answers

    const selectedAnswer = stats.userAnswers.find(
      (ans) => ans.percentage !== null,
    );
    const selectedQOId = selectedAnswer?.questionOptionId ?? null;
    const selectedPercentage = selectedAnswer?.percentage ?? null;

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
      isSelectedCorrectNullIfNotOpened: stats.isSecondOrderCorrect,
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

      <InfoDrawer
        isOpen={isSecOrdAnsInfoDrawerOpen}
        onClose={handleSecOrdAnsInfoDrawerClose}
        title="Your second order answer"
      >
        <div className="text-sm mb-6 space-y-4">
          <p>
            The second order answer represent what a player predicted OTHERS
            would guess.
          </p>
          <p>
            We take the average of each user’s prediction to generate this
            result. Mathematically this won’t always add up to 100%!
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
