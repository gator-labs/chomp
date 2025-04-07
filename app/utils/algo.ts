"server-only";

import { QuestionType } from "@prisma/client";

import prisma from "../services/prisma";
import { getAverage } from "./array";

const getMechanismEngineResponse = async (path: string, body: unknown) => {
  if (path.startsWith("/")) {
    throw new Error("Mechanism engine path must not start with a slash");
  }

  if (!process.env.MECHANISM_ENGINE_URL)
    throw new Error("MECHANISM_ENGINE_URL not defined");

  try {
    const response = await fetch(
      `${process.env.MECHANISM_ENGINE_URL}/api/chomp/${path}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      },
    );

    if (!response.ok)
      throw new Error(
        `Mechanism engine returned error: ${response.status}: ${response.statusText}`,
      );

    return await response.json();
  } catch (e) {
    console.error("exception", e, "triggered with this data", path, body);
    throw e;
  }
};

export const calculateReward = async (
  userId: string,
  questionIds: number[],
) => {
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: true,
        },
      },
    },
  });

  const questionRewards: {
    questionId: number;
    rewardAmount: number;
    revealAmount: number;
  }[] = [];

  for (const question of questions) {
    if (question.creditCostPerQuestion === null)
      throw new Error(
        "Mechanism engine: unable to calculate reward for legacy question",
      );

    const optionsList = question.questionOptions.map((option) => option.id);
    const inputList = ["a", "b", "c", "d", "e", "f", "g"];

    const userAnswer = question.questionOptions
      .flatMap((option) => option.questionAnswers)
      .filter((answer) =>
        question.type === QuestionType.BinaryQuestion
          ? answer.percentage !== null
          : answer,
      )
      .find((answer) => answer.userId === userId && answer.selected);

    if (!userAnswer) {
      questionRewards.push({
        questionId: question.id,
        rewardAmount: 0,
        revealAmount: 0,
      });
      continue;
    }

    let body = {
      first_order_choice: "",
      first_order_actual: "",
      second_order_estimate: 0,
      second_order_mean: 0,
      second_order_estimates: [0],
      question_cost: 0,
      token_reward: 0,
    };

    const correctOptionIndex = question.questionOptions.findIndex(
      (option) => option.isCorrect,
    );
    const calculatedCorrectOptionIndex = question.questionOptions.findIndex(
      (option) => option.calculatedIsCorrect,
    );

    const questionOption = await prisma.questionOption.findFirst({
      where: {
        id: userAnswer.questionOptionId,
      },
    });

    if (question.type === QuestionType.BinaryQuestion) {
      const correctOption = question.questionOptions[correctOptionIndex];

      const calculatedCorrectOption =
        question.questionOptions[calculatedCorrectOptionIndex];

      const second_order_estimates = (
        correctOption || calculatedCorrectOption
      )?.questionAnswers
        .filter((answer) => answer.selected && answer.percentage !== null)
        .map((answer) => answer.percentage!);

      body = {
        first_order_choice:
          inputList[optionsList.indexOf(userAnswer.questionOptionId)],
        first_order_actual:
          inputList[
            correctOptionIndex === -1
              ? calculatedCorrectOptionIndex
              : correctOptionIndex
          ],
        second_order_estimate: userAnswer.percentage!,
        second_order_mean:
          questionOption?.calculatedAveragePercentage ??
          getAverage(second_order_estimates),
        second_order_estimates,
        question_cost: question.creditCostPerQuestion,
        token_reward: question.revealTokenAmount,
      };
    }

    if (question.type === QuestionType.MultiChoice) {
      const questionOptionAnswers = question.questionOptions.flatMap(
        (option) => option.questionAnswers,
      );

      const estimatedOption = questionOptionAnswers.find(
        (answer) => answer.userId === userId && answer.percentage !== null,
      );

      const second_order_estimates = questionOptionAnswers
        .filter(
          (answer) =>
            estimatedOption?.questionOptionId === answer.questionOptionId &&
            answer.percentage !== null,
        )
        .map((answer) => answer.percentage!);

      body = {
        first_order_choice:
          inputList[optionsList.indexOf(userAnswer.questionOptionId)],
        first_order_actual:
          inputList[
            correctOptionIndex === -1
              ? calculatedCorrectOptionIndex
              : correctOptionIndex
          ],
        second_order_estimate: estimatedOption!.percentage!,
        second_order_mean:
          questionOption?.calculatedAveragePercentage ??
          getAverage(second_order_estimates),
        second_order_estimates: second_order_estimates,
        question_cost: question.creditCostPerQuestion,
        token_reward: question.revealTokenAmount,
      };
    }

    console.log(
      "user",
      userId,
      "requesting reward for question",
      question.id,
      "with body",
      body,
    );

    const { rewards } = await getMechanismEngineResponse("rewards", body);

    questionRewards.push({
      questionId: question.id,
      rewardAmount: Number(rewards) || 0,
      revealAmount: question.revealTokenAmount,
    });

    console.log(
      "user",
      userId,
      "got",
      rewards,
      "bonk for",
      question.id,
      "question",
    );
  }

  console.log("user", userId, "for questions ", questionIds);

  return questionRewards;
};

export const calculateMysteryBoxReward = async (rewardEventType: string) => {
  const res = await getMechanismEngineResponse("mystery-box", {
    event_type: rewardEventType,
  });

  return res;
};

export const calculateMysteryBoxHubReward = async (
  userId: string,
  questionIds: number[],
) => {
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: true,
        },
      },
    },
  });

  const questionRewards: {
    questionId: number;
    creditRewardAmount: number;
    bonkRewardAmount: number;
  }[] = [];

  for (const question of questions) {
    if (question.creditCostPerQuestion === null)
      throw new Error(
        "Mechanism engine: unable to calculate reward for legacy question",
      );

    const optionsList = question.questionOptions.map((option) => option.id);
    const inputList = ["a", "b", "c", "d", "e", "f", "g"];

    const userAnswer = question.questionOptions
      .flatMap((option) => option.questionAnswers)
      .filter((answer) =>
        question.type === QuestionType.BinaryQuestion
          ? answer.percentage !== null
          : answer,
      )
      .find((answer) => answer.userId === userId && answer.selected);

    if (!userAnswer) {
      questionRewards.push({
        questionId: question.id,
        creditRewardAmount: 0,
        bonkRewardAmount: 0,
      });
      continue;
    }

    let body = {
      first_order_choice: "",
      first_order_actual: "",
      second_order_estimate: 0,
      second_order_mean: 0,
      second_order_estimates: [0],
      question_cost: 0,
      token_reward: 0,
    };

    const correctOptionIndex = question.questionOptions.findIndex(
      (option) => option.isCorrect,
    );
    const calculatedCorrectOptionIndex = question.questionOptions.findIndex(
      (option) => option.calculatedIsCorrect,
    );

    const questionOption = await prisma.questionOption.findFirst({
      where: {
        id: userAnswer.questionOptionId,
      },
    });
    if (question.type === QuestionType.BinaryQuestion) {
      const correctOption = question.questionOptions[correctOptionIndex];

      const calculatedCorrectOption =
        question.questionOptions[calculatedCorrectOptionIndex];

      const second_order_estimates = (
        correctOption || calculatedCorrectOption
      )?.questionAnswers
        .filter((answer) => answer.selected && answer.percentage !== null)
        .map((answer) => answer.percentage!);

      body = {
        first_order_choice:
          inputList[optionsList.indexOf(userAnswer.questionOptionId)],
        first_order_actual:
          inputList[
            correctOptionIndex === -1
              ? calculatedCorrectOptionIndex
              : correctOptionIndex
          ],
        second_order_estimate: userAnswer.percentage!,
        second_order_mean:
          questionOption?.calculatedAveragePercentage ??
          getAverage(second_order_estimates),
        second_order_estimates,
        question_cost: question.creditCostPerQuestion,
        token_reward: question.revealTokenAmount,
      };
    }

    if (question.type === QuestionType.MultiChoice) {
      const questionOptionAnswers = question.questionOptions.flatMap(
        (option) => option.questionAnswers,
      );

      const estimatedOption = questionOptionAnswers.find(
        (answer) => answer.userId === userId && answer.percentage !== null,
      );

      const second_order_estimates = questionOptionAnswers
        .filter(
          (answer) =>
            estimatedOption?.questionOptionId === answer.questionOptionId &&
            answer.percentage !== null,
        )
        .map((answer) => answer.percentage!);

      body = {
        first_order_choice:
          inputList[optionsList.indexOf(userAnswer.questionOptionId)],
        first_order_actual:
          inputList[
            correctOptionIndex === -1
              ? calculatedCorrectOptionIndex
              : correctOptionIndex
          ],
        second_order_estimate: estimatedOption!.percentage!,
        second_order_mean:
          questionOption?.calculatedAveragePercentage ??
          getAverage(second_order_estimates),
        second_order_estimates: second_order_estimates,
        question_cost: question.creditCostPerQuestion,
        token_reward: question.revealTokenAmount,
      };
    }

    const rewards = await getMechanismEngineResponse("rewards", body);

    questionRewards.push({
      questionId: question.id,
      creditRewardAmount: Number(rewards?.credits),
      bonkRewardAmount: Number(rewards?.bonk),
    });
  }

  return questionRewards;
};
