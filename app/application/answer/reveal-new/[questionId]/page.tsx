"use client";

import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import BinaryPieChart from "@/components/BinaryPieChart/BinaryPieChart";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
import MultiChoicePieChart from "@/components/MultiChoicePieChart/MultiChoicePieChart";
import QuestionPreviewCard from "@/components/QuestionPreviewCard/QuestionPreviewCard";
import { useGetAnswerStatsQuery } from "@/hooks/useGetAnswerStatsQuery";
import { QuestionType } from "@prisma/client";

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
        isCorrect={stats.isFirstOrderCorrect}
        isPracticeQuestion={stats.isPracticeQuestion}
        bonkReward={stats.QuestionRewards?.[0]?.bonkReward}
        creditsReward={stats.QuestionRewards?.[0]?.creditsReward}
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
