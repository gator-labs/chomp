import { QuestionType } from "@prisma/client";
import { answerPercentageQuery } from "../queries/answerPercentageQuery";
import prisma from "../services/prisma";

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
  try {
    return await fetch(
      `https://mechanism-engine.vercel.app/api/chomp/${path}`,
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
    const body = {
      first_order_percent_A: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[0].id,
      )?.percentageResult,
      first_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[1].id,
      )?.percentageResult,
      second_order_percent_A: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[0].id,
      )?.averagePercentAnswer,
      second_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[1].id,
      )?.averagePercentAnswer,
    };

    const { answer } = await getMechanismEngineResponse("answer/binary", body);

    const resultList = ["A", "B"];
    correctOptionIds.push(
      question.questionOptions[resultList.indexOf(answer)].id,
    );
  }

  await prisma.$transaction([
    ...questionOptionPercentages.map((percentage) =>
      prisma.questionOption.update({
        where: {
          id: percentage.id,
        },
        data: {
          calculatedIsCorrect: correctOptionIds.includes(percentage.id),
          calculatedPercentageOfSelectedAnswers: percentage.percentageResult,
          calculatedAveragePercentage: percentage.averagePercentAnswer,
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
    const optionsList = question.questionOptions.map((option) => option.id);

    const body = {
      first_order_answers: question.questionOptions.flatMap((option) =>
        option.questionAnswers.map((_) => optionsList.indexOf(option.id)),
      ),
      second_order_answers: question.questionOptions.map((option) =>
        option.questionAnswers
          .map((answer) => answer.percentage)
          .filter((percentage) => percentage !== null),
      ),
    };

    const { answer } = await getMechanismEngineResponse(
      "answer/multi-choice",
      body,
    );

    const resultList = ["A", "B", "C", "D", "E", "F", "G"];
    correctOptionIds.push(optionsList[resultList.indexOf(answer)]);
  }

  await prisma.$transaction([
    ...questionOptionPercentages.map((percentage) =>
      prisma.questionOption.update({
        where: {
          id: percentage.id,
        },
        data: {
          calculatedIsCorrect: correctOptionIds.includes(percentage.id),
          calculatedPercentageOfSelectedAnswers: percentage.percentageResult,
          calculatedAveragePercentage: percentage.averagePercentAnswer,
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
          questionAnswers: {
            where: {
              percentage: {
                not: null,
              },
            },
          },
        },
      },
    },
  });

  let rewardTotal = 0;

  for (const question of questions) {
    const optionsList = question.questionOptions.map((option) => option.id);
    const inputList = ["a", "b", "c", "d", "e", "f", "g"];

    const userAnswer = question.questionOptions
      .flatMap((option) => option.questionAnswers)
      .find((answer) => answer.userId === userId && answer.selected);

    if (!userAnswer) {
      return;
    }

    const body = {
      first_order_choice:
        inputList[optionsList.indexOf(userAnswer.questionOptionId)],
      first_order_actual:
        inputList[
          question.questionOptions.findIndex(
            (option) => option.calculatedIsCorrect,
          )
        ],
      second_order_estimate: userAnswer.percentage,
      second_order_mean: question.questionOptions.find(
        (option) => option.calculatedIsCorrect,
      )?.calculatedAveragePercentage,
      second_order_estimates: question.questionOptions
        .find((option) => option.id === userAnswer.questionOptionId)
        ?.questionAnswers.map((answer) => answer.percentage),
    };

    console.log(
      "user",
      userId,
      "requesting reward for question",
      question.id,
      "with body",
      body,
    );

    const { rewards } = await getMechanismEngineResponse("rewards", body);

    console.log(
      "user",
      userId,
      "got",
      rewards,
      "bonk for",
      question.id,
      "question",
    );

    rewardTotal += +rewards;
  }

  console.log("rewardsTotal", rewardTotal, "user", userId);

  return rewardTotal;
};
