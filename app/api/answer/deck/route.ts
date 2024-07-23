import { SaveQuestionRequest } from "@/app/actions/answer";
import { updateStreak } from "@/app/actions/streak";
import { hasAnsweredDeck } from "@/app/queries/deck";
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
  const { deckId, userId, answers } = data;
  const request: SaveQuestionRequest[] = answers;

  const hasAnswered = await hasAnsweredDeck(deckId, userId, true);

  if (hasAnswered) {
    return;
  }

  const deck = await prisma.deck.findFirst({
    where: { id: { equals: deckId } },
  });

  if (deck?.revealAtDate && dayjs(deck?.revealAtDate).isBefore(new Date())) {
    return;
  }

  const questionIds = request
    .filter((dr) => dr.percentageGiven !== undefined && !!dr.questionOptionId)
    .map((dr) => dr.questionId);

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: { in: questionIds } },
    include: { question: true },
  });

  const questionAnswers = questionOptions.map((qo) => {
    const answerForQuestion = request.find(
      (r) => r.questionId === qo.questionId,
    );
    const isOptionSelected = qo.id === answerForQuestion?.questionOptionId;

    const percentageForQuestionOption =
      answerForQuestion?.percentageGivenForAnswerId === qo.id
        ? answerForQuestion.percentageGiven
        : undefined;

    const percentage =
      qo.question.type === QuestionType.BinaryQuestion &&
      !percentageForQuestionOption
        ? 100 - answerForQuestion!.percentageGiven!
        : percentageForQuestionOption;

    return {
      selected: isOptionSelected,
      percentage,
      questionOptionId: qo.id,
      timeToAnswer: answerForQuestion?.timeToAnswerInMiliseconds
        ? BigInt(answerForQuestion?.timeToAnswerInMiliseconds)
        : null,
      userId,
    } as QuestionAnswer;
  });

  await prisma.$transaction(async (tx) => {
    await tx.userDeck.create({
      data: {
        deckId: deckId,
        userId: userId,
      },
    });

    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });

    await updateStreak(userId);
  });

  return Response.json({ message: "Answers saved successfully" });
}
