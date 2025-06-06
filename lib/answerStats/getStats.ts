"server-only";

import prisma from "@/app/services/prisma";
import {
  isEntityRevealable,
  mapPercentages,
  populateAnswerCount,
} from "@/app/utils/question";
import { MAX_DECIMALS } from "@/constants/tokens";
import { AnswerStats } from "@/types/answerStats";
import Decimal from "decimal.js";

export async function getAnswerStats(
  userId: string,
  questionId: number,
): Promise<AnswerStats | null> {
  const question = await prisma.question.findUnique({
    where: {
      id: questionId,
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: {
            where: {
              userId: userId,
            },
          },
        },
      },
      chompResults: {
        where: {
          userId,
        },
        include: {
          revealNft: true,
        },
      },
      deckQuestions: {
        select: {
          deckId: true,
        },
      },
      QuestionRewards: {
        where: {
          userId,
          questionId,
        },
      },
    },
  });

  if (!question) {
    return null;
  }

  const calculatedQuestionOptionPercentages = question.questionOptions.map(
    (qo) => ({
      id: qo.id,
      firstOrderSelectedAnswerPercentage:
        qo.calculatedPercentageOfSelectedAnswers,
      secondOrderAveragePercentagePicked: qo.calculatedAveragePercentage,
      option: qo.option,
    }),
  );

  // Waiting on mechanism engine calculations...
  const isCalculated = !calculatedQuestionOptionPercentages.some(
    (qo) =>
      qo.firstOrderSelectedAnswerPercentage === null ||
      qo.secondOrderAveragePercentagePicked === null,
  );

  const questionOrderPercentages = isCalculated
    ? calculatedQuestionOptionPercentages.map((cqop) => ({
        id: cqop.id,
        firstOrderSelectedAnswerPercentage: Number(
          cqop.firstOrderSelectedAnswerPercentage ?? 0,
        ),
        secondOrderAveragePercentagePicked: Number(
          cqop.secondOrderAveragePercentagePicked ?? 0,
        ),
      }))
    : [];

  const populated = populateAnswerCount(question);

  mapPercentages([question] as any, questionOrderPercentages);

  const userAnswers = question.questionOptions
    .flatMap((option) =>
      option.questionAnswers.map((answer) => ({
        ...answer,
        questionOption: {
          id: option.id,
          option: option.option,
          isLeft: option.isLeft,
          createdAt: option.createdAt,
          updatedAt: option.updatedAt,
          questionId: option.questionId,
        },
      })),
    )
    .filter((answer) => answer.userId === userId);

  let correctAnswer = question.questionOptions.find(
    (option) => option.isCorrect,
  );

  if (!correctAnswer) {
    correctAnswer = question.questionOptions.find(
      (option) => option.calculatedIsCorrect,
    );
  }

  const isQuestionRevealable = isEntityRevealable({
    revealAtAnswerCount: question.revealAtAnswerCount,
    revealAtDate: question.revealAtDate,
    answerCount: question.questionOptions[0].questionAnswers.length,
  });

  const isLegacyQuestion = question.creditCostPerQuestion === null;

  if (!isQuestionRevealable || !isCalculated) {
    return {
      ...{ ...question, questionOptions: [] },
      userAnswers: [],
      answerCount: 0,
      correctAnswer: null,
      questionOptionPercentages: [],
      isQuestionRevealable,
      isCalculated: false,
      hasAlreadyClaimedReward: false,
      isFirstOrderCorrect: false,
      isSecondOrderCorrect: null,
      isPracticeQuestion: false,
      questionAnswerCount: 0,
      correctAnswersCount: 0,
      isLegacyQuestion,
      isQuestionAnsweredByUser: false,
      isSecondOrderAnsweredByUser: false,
      rewardStatus: "no-reward",
      selectionDistribution: [],
    };
  }

  const answerSelected = userAnswers.find((ua) => ua.selected);
  const isFirstOrderCorrect =
    correctAnswer?.id === answerSelected?.questionOptionId;
  const isPracticeQuestion = question.creditCostPerQuestion === 0;

  const questionAnswers = await prisma.questionAnswer.findMany({
    where: {
      questionOptionId: {
        in: question.questionOptions.map((qo) => qo.id),
      },
    },
    include: {
      questionOption: true,
    },
  });

  const selectionDistributionMap = new Map();
  questionAnswers.forEach((qa) => {
    const option = qa.questionOption.option;
    if (qa.selected === true) {
      selectionDistributionMap.set(
        option,
        (selectionDistributionMap.get(option) || 0) + 1,
      );
    }
    if (selectionDistributionMap.get(option) === undefined) {
      selectionDistributionMap.set(option, 0);
    }
  });

  const selectionDistribution = Array.from(
    selectionDistributionMap,
    ([option, count]) => ({
      option,
      count,
    }),
  );

  const numSelectedCorrect = questionAnswers.reduce(
    (count, qa) =>
      qa.selected && qa.questionOptionId === correctAnswer?.id
        ? count + 1
        : count,
    0,
  );

  const isQuestionAnsweredByUser =
    userAnswers.filter((ua) => !!ua.selected).length > 0;

  const isSecondOrderAnsweredByUser =
    userAnswers.filter(
      (ua) => ua.percentage !== null && ua.percentage !== undefined,
    ).length > 0;

  const chompResults = question.chompResults.map((chompResult) => ({
    ...chompResult,
    rewardTokenAmount: chompResult.rewardTokenAmount?.toNumber(),
  }));

  if (chompResults.length > 0) {
    question.QuestionRewards = [
      {
        userId,
        questionId,
        creditsReward: "0",
        bonkReward: Number(chompResults?.[0].rewardTokenAmount ?? 0).toString(),
      },
    ];
  }

  const isRewardKnown = question.QuestionRewards.length > 0;

  const rewardStatus = isLegacyQuestion
    ? chompResults.length > 0
      ? "claimed"
      : "no-reward"
    : isPracticeQuestion ||
        !isQuestionAnsweredByUser ||
        !isSecondOrderAnsweredByUser
      ? "no-reward"
      : isRewardKnown
        ? "claimed"
        : "claimable";

  const hasBonkPrize = new Decimal(
    question.QuestionRewards?.[0]?.bonkReward ?? "0",
  )
    .toDP(Decimal.ROUND_DOWN, MAX_DECIMALS.BONK)
    .greaterThan("0");

  const isSecondOrderCorrect = !isLegacyQuestion
    ? isRewardKnown
      ? hasBonkPrize
      : null
    : (chompResults?.[0]?.rewardTokenAmount ?? 0) > question.revealTokenAmount;

  return {
    ...question,
    userAnswers: isCalculated ? userAnswers : [],
    answerCount: populated.answerCount ?? 0,
    correctAnswer: correctAnswer ?? null,
    questionOptionPercentages: questionOrderPercentages.map((qop) => ({
      ...qop,
      ...question.questionOptions.find((qo) => qo.id === qop.id),
    })),
    isQuestionRevealable,
    isCalculated,
    hasAlreadyClaimedReward:
      isLegacyQuestion || question.QuestionRewards.length > 0,
    isFirstOrderCorrect,
    isSecondOrderCorrect,
    isPracticeQuestion,
    questionAnswerCount:
      question.type === "BinaryQuestion"
        ? questionAnswers.length / 2
        : questionAnswers.length / 4,
    correctAnswersCount: numSelectedCorrect,
    isQuestionAnsweredByUser,
    isSecondOrderAnsweredByUser,
    isLegacyQuestion,
    rewardStatus,
    selectionDistribution: selectionDistribution,
  };
}
