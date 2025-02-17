import { QuestionType } from "@prisma/client";
import "server-only";

import { answerPercentageQuery } from "../queries/answerPercentageQuery";
import prisma from "../services/prisma";
import { getAverage } from "./array";

export const calculateCorrectAnswer = async (questionIds: number[]) => {
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    select: {
      id: true,
      type: true,
    },
  });

  await Promise.all([
    calculateBinaryCorrectAnswer(
      questions
        .filter((question) => question.type === QuestionType.BinaryQuestion)
        .map((question) => question.id),
    ),
    calculateMultiChoiceCorrectAnswer(
      questions
        .filter((question) => question.type === QuestionType.MultiChoice)
        .map((question) => question.id),
    ),
  ]);
};

const getMechanismEngineResponse = async (path: string, body: unknown) => {
  if (!process.env.MECHANISM_ENGINE_URL)
    throw new Error("MECHANISM_ENGINE_URL not defined");

  try {
    return await fetch(
      `${process.env.MECHANISM_ENGINE_URL}/api/chomp/${path}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(body),
      },
    ).then((res) => res.json());
  } catch (e) {
    console.error("exception", e, "triggered with this data", path, body);
  }
};

const calculateBinaryCorrectAnswer = async (questionIds: number[]) => {
  const questions = await prisma.question.findMany({
    where: {
      id: {
        in: questionIds,
      },
    },
    include: {
      questionOptions: true,
    },
  });

  const questionOptionPercentages = await answerPercentageQuery(
    questions.flatMap((q) => q.questionOptions.map((qo) => qo.id)),
  );

  const correctOptionIds: number[] = [];

  for (const question of questions) {
    const questionOptions = question.questionOptions;
    const correctOption = questionOptions.find((option) => option.isCorrect);

    if (!!correctOption) {
      correctOptionIds.push(correctOption.id);
      continue;
    }

    const body = {
      first_order_percent_A: questionOptionPercentages.find(
        (percentage) => percentage.id === questionOptions[0].id,
      )?.firstOrderSelectedAnswerPercentage,
      first_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === questionOptions[1].id,
      )?.firstOrderSelectedAnswerPercentage,
      second_order_percent_A: questionOptionPercentages.find(
        (percentage) => percentage.id === questionOptions[0].id,
      )?.secondOrderAveragePercentagePicked,
      second_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === questionOptions[1].id,
      )?.secondOrderAveragePercentagePicked,
    };

    const { answer } = await getMechanismEngineResponse("answer/binary", body);

    const resultList = ["A", "B"];
    correctOptionIds.push(questionOptions[resultList.indexOf(answer)].id);
  }

  await prisma.$transaction([
    ...questionOptionPercentages.map((percentage) =>
      prisma.questionOption.update({
        where: {
          id: percentage.id,
        },
        data: {
          calculatedIsCorrect: correctOptionIds.includes(percentage.id),
          calculatedPercentageOfSelectedAnswers:
            percentage.firstOrderSelectedAnswerPercentage,
          calculatedAveragePercentage:
            percentage.secondOrderAveragePercentagePicked,
        },
      }),
    ),
  ]);
};

const calculateMultiChoiceCorrectAnswer = async (questionIds: number[]) => {
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

  const questionOptionPercentages = await answerPercentageQuery(
    questions.flatMap((q) => q.questionOptions.map((qo) => qo.id)),
  );

  const correctOptionIds: number[] = [];

  for (const question of questions) {
    const questionOptions = question.questionOptions;
    const correctOption = questionOptions.find((option) => option.isCorrect);

    if (!!correctOption) {
      correctOptionIds.push(correctOption.id);
      continue;
    }

    const optionsList = questionOptions.map((option) => option.id);

    const body = {
      first_order_answers: questionOptions.flatMap((option) =>
        option.questionAnswers.map(() => optionsList.indexOf(option.id)),
      ),
      second_order_answers: questionOptions.map((option) =>
        option.questionAnswers
          .map((answer) => answer.percentage)
          .filter((percentage) => percentage !== null),
      ),
    };

    const response = await getMechanismEngineResponse(
      "answer/multi-choice",
      body,
    );

    const resultList = ["A", "B", "C", "D", "E", "F", "G"];
    correctOptionIds.push(optionsList[resultList.indexOf(response?.answer)]);
  }

  await prisma.$transaction([
    ...questionOptionPercentages.map((percentage) =>
      prisma.questionOption.update({
        where: {
          id: percentage.id,
        },
        data: {
          calculatedIsCorrect: correctOptionIds.includes(percentage.id),
          calculatedPercentageOfSelectedAnswers:
            percentage.firstOrderSelectedAnswerPercentage,
          calculatedAveragePercentage:
            percentage.secondOrderAveragePercentagePicked,
        },
      }),
    ),
  ]);
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
        question_cost: question.creditCostPerQuestion ?? 0,
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
        question_cost: question.creditCostPerQuestion ?? 0,
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

    if (question.creditCostPerQuestion === null)
      new Error(
        "Mechanism engine: unable to calculate reward for legacy question",
      );

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
        question_cost: question.creditCostPerQuestion ?? 0,
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
        question_cost: question.creditCostPerQuestion ?? 0,
        token_reward: question.revealTokenAmount,
      };
    }

    const rewards = await getMechanismEngineResponse("v2/rewards", body);

    questionRewards.push({
      questionId: question.id,
      creditRewardAmount: Number(rewards?.credits),
      bonkRewardAmount: Number(rewards?.bonk),
    });
  }

  return questionRewards;
};
