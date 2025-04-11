"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import { useGetAnswerStatsQuery } from "@/hooks/useGetAnswerStatsQuery";
import { notFound } from "next/navigation";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPageNew = ({ params }: Props) => {
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

  const result = useGetAnswerStatsQuery(Number(params.questionId));

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

  return (
    <div>
      <AnswerStatsHeader
        title={stats.question}
        deckId={stats.deckQuestions?.[0]?.deckId ?? null}
        isCorrect={stats.isFirstOrderCorrect}
        isPracticeQuestion={stats.isPracticeQuestion}
        bonkReward={stats.QuestionRewards?.[0]?.bonkReward ?? "0"}
        creditsReward={stats.QuestionRewards?.[0]?.creditsReward ?? "0"}
        isRewardKnown={stats.QuestionRewards.length > 0}
      />
    </div>
  );
};

export default RevealAnswerPageNew;
