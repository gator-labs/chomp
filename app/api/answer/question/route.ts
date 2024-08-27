/*
  THIS API STORES ANSWER OF A QUESTION
*/

import { SaveQuestionRequest } from "@/app/actions/answer";
import { incrementFungibleAssetBalance } from "@/app/actions/fungible-asset";
import { updateStreak } from "@/app/actions/streak";
import { pointsPerAction } from "@/app/constants/points";
import { hasAnsweredQuestion } from "@/app/queries/question";
import prisma from "@/app/services/prisma";
import {
  FungibleAsset,
  QuestionAnswer,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
import dayjs from "dayjs";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    // Validates API key for authentication
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const data = await req.json();
  const { userId, answer } = data;
  const request: SaveQuestionRequest = answer;

  const hasAnswered = await hasAnsweredQuestion(
    request.questionId,
    userId,
    true,
  );

  if (hasAnswered) {
    return new Response("Already answered", { status: 400 });
  }

  const question = await prisma.question.findFirst({
    where: { id: { equals: request.questionId } },
  });

  if (
    question?.revealAtDate &&
    dayjs(question?.revealAtDate).isBefore(new Date()) // Question reveal date must be after CURRENT_DATETIME
  ) {
    return new Response("Reveal date is before today", { status: 400 });
  }

  try {
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: request.questionId },
      include: { question: true },
    });

    const questionAnswers = questionOptions.map((qo) => {
      const isOptionSelected = qo.id === request?.questionOptionId;

      const percentageForQuestionOption =
        request?.percentageGivenForAnswerId === qo.id
          ? request.percentageGiven
          : undefined;

      const percentage =
        qo.question.type === QuestionType.BinaryQuestion &&
        !percentageForQuestionOption
          ? 100 - request!.percentageGiven!
          : percentageForQuestionOption;

      return {
        selected: isOptionSelected,
        percentage,
        questionOptionId: qo.id,
        timeToAnswer: request?.timeToAnswerInMiliseconds
          ? BigInt(request?.timeToAnswerInMiliseconds)
          : null,
        userId,
      } as QuestionAnswer;
    });

    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.createMany({
        data: questionAnswers,
      });

      await incrementFungibleAssetBalance({
        asset: FungibleAsset.Point,
        amount: pointsPerAction[TransactionLogType.AnswerQuestion],
        transactionLogType: TransactionLogType.AnswerQuestion,
        injectedPrisma: tx,
        questionIds: [request.questionId],
        userId,
      });

      await updateStreak(userId);
    });

    return Response.json({ message: "Answer saved successfully" });
  } catch (error) {
    return new Response("Failed to save answer!", { status: 400 });
  }
}
