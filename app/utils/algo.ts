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

    console.log("body", JSON.stringify(body));

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
