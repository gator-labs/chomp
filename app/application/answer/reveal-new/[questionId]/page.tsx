"use client";

import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import { useGetAnswerStatsQuery } from "@/hooks/useGetAnswerStatsQuery";

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPageNew = ({ params }: Props) => {
  // Parameters can be undefined on the first render;
  // return a promise to trigger suspense further up
  // the tree until we have the values.
  if (params.questionId === undefined)
    throw new Promise((r) => setTimeout(r, 0));

  const result = useGetAnswerStatsQuery(Number(params.questionId));

  if (result.isLoading || !result.data) return <div>Loading...</div>;

  if (result.isError) return <div>Error fetching question.</div>;

  const stats = result.data.stats;

  return (
    <div>
      <AnswerStatsHeader
        title={stats.question}
        isCorrect={stats.isFirstOrderCorrect}
        isPracticeQuestion={stats.isPracticeQuestion}
        bonkReward={stats.QuestionRewards?.[0].bonkReward}
        creditsReward={stats.QuestionRewards?.[0].creditsReward}
      />
    </div>
  );
};

export default RevealAnswerPageNew;
