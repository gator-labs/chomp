"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import BinaryFirstOrderAnswerChart from "@/components/BinaryFirstOrderAnswer/BinaryFirstOrderAnswer";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
import MultiChoiceFirstOrderAnswer from "@/components/MultiChoiceFirstOrderAnswer/MultiChoiceFirstOrderAnswer";
import QuestionPreviewCard from "@/components/QuestionPreviewCard/QuestionPreviewCard";
import SecondOrderAnswerResults from "@/components/SecondOrderAnswerResult";
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

  const openSecOrdAnsInfoDrawer = () => {
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

  const isBinary = stats.type === QuestionType.BinaryQuestion;

  const answerSelected = stats.userAnswers.find((ua) => ua.selected);

  if (!stats.isCalculated) {
    return (
      <div className="p-10 w-full flex justify-center">
        Results not calculated yet.
      </div>
    );
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
      {!!isBinary ? (
        <>
          <BinaryBestAnswer
            questionOptions={stats.questionOptions}
            optionSelected={answerSelected?.questionOption?.option ?? null}
            bestOption={stats.correctAnswer?.option ?? ""}
          />
          <BinaryFirstOrderAnswerChart
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
          <MultiChoiceFirstOrderAnswer
            optionSelected={answerSelected?.questionOption?.option ?? null}
            bestOption={stats.correctAnswer?.option ?? ""}
            totalAnswers={stats.questionAnswerCount}
            correctAnswers={stats.correctAnswersCount}
            selectionDistribution={stats.selectionDistribution}
            questionOptions={stats.questionOptions}
          />
        </>
      )}
      <SecondOrderAnswerResults
        showLetters={!isBinary}
        userAnswers={stats.userAnswers}
        questionOptionPercentages={stats.questionOptionPercentages}
        answerStatus={stats.isSecondOrderCorrect}
        isDrawerOpen={isSecOrdAnsInfoDrawerOpen}
        openDrawer={openSecOrdAnsInfoDrawer}
        closeDrawer={handleSecOrdAnsInfoDrawerClose}
      />
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
