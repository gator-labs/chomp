"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import BinaryPieChart from "@/components/BinaryPieChart/BinaryPieChart";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
import MultiChoicePieChart from "@/components/MultiChoicePieChart/MultiChoicePieChart";
import QuestionPreviewCard from "@/components/QuestionPreviewCard/QuestionPreviewCard";
import { useGetAnswerStatsQuery } from "@/hooks/useGetAnswerStatsQuery";
import { QuestionType } from "@prisma/client";
import { notFound } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPageNew = ({ params }: Props) => {
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

  console.log(stats);

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
        totalAnswers={stats.totalAnswers}
        correctAnswers={stats.correctAnswers}
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
        questionOptions={stats.questionOptions}
        optionSelected={answerSelected?.questionOption?.option ?? null}
        bestOption={stats.correctAnswer?.option ?? ""}
        totalAnswers={stats.totalAnswers}
        correctAnswers={stats.correctAnswers}
      />
    </>
  );

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
    </div>
  );
};

export default RevealAnswerPageNew;
