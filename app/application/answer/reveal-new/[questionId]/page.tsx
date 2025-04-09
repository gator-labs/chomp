"use client";

import BackButton from "@/app/components/BackButton/BackButton";
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

  const stats = useGetAnswerStatsQuery(Number(params.questionId));

  if (stats.isLoading) return <div>Loading...</div>;

  if (stats.isError) return <div>Error fetching question.</div>;

  return (
    <div>
      <BackButton />
      <div>{stats.data?.stats.question}</div>
    </div>
  );
};

export default RevealAnswerPageNew;
