"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
import { AnswerStatsHeader } from "@/components/AnswerStats/AnswerStatsHeader";
import BinaryBestAnswer from "@/components/BinaryBestAnswer/BinaryBestAnswer";
import MultiChoiceBestAnswer from "@/components/MultiChoiceBestAnswer/MultiChoiceBestAnswer";
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
  const FF_NEW_ANSWER_PAGE =
    process.env.NEXT_PUBLIC_FF_NEW_ANSWER_PAGE === "true";

  if (!FF_NEW_ANSWER_PAGE) notFound();

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
