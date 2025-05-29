import prisma from "@/app/services/prisma";
import { QuestionType } from "@prisma/client";
import "server-only";
import { v4 as uuidv4 } from "uuid";

import {
  ApiAnswerInvalidError,
  ApiOptionInvalidError,
  ApiQuestionInactiveError,
  ApiQuestionInvalidError,
} from "../error";

export async function answerQuestion(
  userId: string,
  questionId: string,
  source: string,
  firstOrderOptionId: string,
  secondOrderOptionId: string,
  secondOrderEstimate: number,
  weight: number,
): Promise<string> {
  const now = new Date();

  const existing = await prisma.questionAnswer.findFirst({
    where: {
      userId,
      questionOption: {
        question: {
          uuid: questionId,
        },
      },
    },
  });

  if (existing) {
    throw new ApiAnswerInvalidError(
      "User already submitted an answer for this question",
    );
  }

  const options = await prisma.questionOption.findMany({
    where: {
      question: {
        uuid: questionId,
        source,
      },
    },
    include: {
      question: true,
    },
  });

  if (options.length === 0) {
    throw new ApiQuestionInvalidError("Question not found or not answerable");
  }

  const question = options[0].question;

  if (!question.activeFromDate || new Date(question.activeFromDate) > now) {
    throw new ApiQuestionInactiveError("Question is not answerable yet");
  }

  if (question.revealAtDate && new Date(question.revealAtDate) <= now) {
    throw new ApiQuestionInactiveError("Question is already resolved");
  }

  const firstOrder = options.find(
    (option) => option.uuid === firstOrderOptionId,
  );
  const secondOrder = options.find(
    (option) => option.uuid === secondOrderOptionId,
  );

  if (!firstOrder)
    throw new ApiOptionInvalidError("First order option not valid");

  if (!secondOrder)
    throw new ApiOptionInvalidError("Second order option not valid");

  const isBinary = question.type === QuestionType.BinaryQuestion;
  const is2ndOrderMismatch = firstOrderOptionId !== secondOrderOptionId;
  if (isBinary && is2ndOrderMismatch) {
    throw new ApiOptionInvalidError(
      "For binary questions, the second order option must be the same as the first order option",
    );
  }

  const uuid = uuidv4();

  const answers = options.map((option) => ({
    uuid,
    userId,
    questionOptionId: option.id,
    selected: option.uuid === firstOrderOptionId,
    percentage:
      option.uuid === secondOrderOptionId ? secondOrderEstimate : null,
    weight,
  }));

  const res = await prisma.questionAnswer.createManyAndReturn({
    data: answers,
  });

  return res[0].uuid;
}
