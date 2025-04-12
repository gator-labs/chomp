"use client";

import ChompFullScreenLoader from "@/app/components/ChompFullScreenLoader/ChompFullScreenLoader";
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

interface Props {
  params: {
    questionId: string;
  };
}

const RevealAnswerPageNew = ({ params }: Props) => {
  const questionId =
    params.questionId === undefined ? undefined : Number(params.questionId);

  const result = useGetAnswerStatsQuery(questionId);

  console.log('Result:');
  console.log(result.data);

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
    const leftQuestionOptionP = result.data.stats.questionOptionPercentages.find((q) => q.isLeft);
    const rightQuestionOptionP = result.data.stats.questionOptionPercentages.find((q) => !q.isLeft);

    const aPercentage = leftQuestionOptionP?.secondOrderAveragePercentagePicked || -1;
    const bPercentage = rightQuestionOptionP?.secondOrderAveragePercentagePicked || -1;

    secondOrderAnswerResults = SecondOrderAnswerResultsBinary({ aPercentage, bPercentage });
  } else {
    const options = result.data.stats.questionOptionPercentages.map(
      ((qop, index) =>
      ({
        option: qop.option,
        label: getAlphaIdentifier(index),
        percentage: qop.secondOrderAveragePercentagePicked,
      })));

    const selectedQOId = result.data.stats.userAnswers.find((ans) => ans.percentage != null);

    // isCreditsQuestions
    const isCreditsQuestions = questionResponse.creditCostPerQuestion !== null;

    const hasAlreadyClaimedReward =
      !isCreditsQuestion || questionResponse.MysteryBoxTrigger.length > 0;

    //const isSecondOrderCorrect = isCreditsQuestion
    //  ? hasAlreadyClaimedReward
    //    ? bonkPrizeAmount > 0
    //    : undefined
    //  : (chompResult?.rewardTokenAmount ?? 0) >
    //  questionResponse.revealTokenAmount;

    let isSecondOrderCorrect;
    if (isCreditsQuestions) {
      // if its credit question and has already claimed 
      if (hasAlreadyClaimedReward) {
        isSecondOrderCorrect = bonkPrizeAmount > 0;
      } else {
        isSecondOrderCorrect = undefined;
      }
    } else {
      isSecondOrderCorrect = (chompResult?.rewardTokenAmount ?? 0) >
        questionResponse.revealTokenAmount;
    }



    secondOrderAnswerResults = SecondOrderAnswerResultsMultiple();
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
    </div>
  );
};

export default RevealAnswerPageNew;
