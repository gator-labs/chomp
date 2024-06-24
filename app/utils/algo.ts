import { QuestionType } from "@prisma/client";
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
      )?.firstOrderSelectedAnswerPercentage,
      first_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[1].id,
      )?.firstOrderSelectedAnswerPercentage,
      second_order_percent_A: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[0].id,
      )?.secondOrderAveragePercentagePicked,
      second_order_percent_B: questionOptionPercentages.find(
        (percentage) => percentage.id === question.questionOptions[1].id,
      )?.secondOrderAveragePercentagePicked,
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

  const rewardsPerQuestionId: Record<number, number> = {};

  for (const question of questions) {
    const optionsList = question.questionOptions.map((option) => option.id);
    const inputList = ["a", "b", "c", "d", "e", "f", "g"];

    const userAnswer = question.questionOptions
      .flatMap((option) => option.questionAnswers)
      .find((answer) => answer.userId === userId && answer.selected);

    if (!userAnswer) {
      return;
    }

    const correctOptionIndex = question.questionOptions.findIndex(
      (option) => option.isCorrect,
    );
    const calculatedCorrectOptionIndex = question.questionOptions.findIndex(
      (option) => option.calculatedIsCorrect,
    );
    const correctOption = question.questionOptions[correctOptionIndex];

    const calculatedCorrectOption =
      question.questionOptions[calculatedCorrectOptionIndex];

    const second_order_estimates = (
      correctOption || calculatedCorrectOption
    )?.questionAnswers
      .filter((answer) => answer.selected)
      .map((answer) => answer.percentage!);

    const body = {
      first_order_choice:
        inputList[optionsList.indexOf(userAnswer.questionOptionId)],
      first_order_actual:
        inputList[
          correctOptionIndex === -1
            ? calculatedCorrectOptionIndex
            : correctOptionIndex
        ],
      second_order_estimate: userAnswer.percentage,
      second_order_mean: getAverage(second_order_estimates),
      second_order_estimates,
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

    rewardsPerQuestionId[question.id] = rewards * 1 ?? 0;

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

  return rewardsPerQuestionId;
};
