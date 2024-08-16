import {
  SaveQuestionRequest,
  removePlaceholderAnswerByQuestion,
} from "@/app/actions/answer";
import { updateStreak } from "@/app/actions/streak";
import { hasAnsweredQuestion } from "@/app/queries/question";
import prisma from "@/app/services/prisma";
import { QuestionAnswer, QuestionType } from "@prisma/client";
import dayjs from "dayjs";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");

  if (apiKey !== process.env.BOT_API_KEY) {
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
    dayjs(question?.revealAtDate).isBefore(new Date())
  ) {
    return new Response("Reveal date is before today", { status: 400 });
  }

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

  await removePlaceholderAnswerByQuestion(request.questionId, userId);
  await prisma.$transaction(async (tx) => {
    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });

    await updateStreak(userId);
  });

  return Response.json({ message: "Answer saved successfully" });
}
