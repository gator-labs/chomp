/*
  THIS API STORES ANSWERS OF MULTIPLE QUESTIONS IN A DECK 
*/

import { SaveQuestionRequest } from "@/app/actions/answer";
import { incrementFungibleAssetBalance } from "@/app/actions/fungible-asset";
import { updateStreak } from "@/app/actions/streak";
import { pointsPerAction } from "@/app/constants/points";
import prisma from "@/app/services/prisma";
import {
  AnswerStatus,
  FungibleAsset,
  QuestionAnswer,
  QuestionType,
  TransactionLogType,
} from "@prisma/client";
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
  const { userId, answers } = data;
  const request: SaveQuestionRequest = answers;

  try {
    const questionOptions = await prisma.questionOption.findMany({
      where: { questionId: request.questionId },
      include: { question: true },
    });

    const questionAnswers = questionOptions.map((qo) => {
      const isOptionSelected = qo.id === request?.questionOptionId;

      const percentageForQuestionOption =
        request?.percentageGivenForAnswerId === qo.id
          ? request?.percentageGiven
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
        status: AnswerStatus.Submitted,
      } as QuestionAnswer;
    });

    await prisma.$transaction(async (tx) => {
      await tx.questionAnswer.deleteMany({
        where: {
          questionOption: {
            questionId: request.questionId,
          },
          userId,
        },
      });

      await tx.questionAnswer.createMany({
        data: questionAnswers,
      });

      const deckQuestions = await tx.deckQuestion.findMany({
        where: {
          deckId: request.deckId,
        },
        include: {
          deck: true,
          question: {
            include: {
              questionOptions: {
                include: {
                  questionAnswers: {
                    where: {
                      userId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const allQuestionOptions = deckQuestions.flatMap((dq) =>
        dq.question.questionOptions.map((qo) => qo),
      );

      const allQuestionAnswers = allQuestionOptions.flatMap((qo) =>
        qo.questionAnswers.filter((qa) => qa.status === AnswerStatus.Submitted),
      );

      const fungibleAssetRevealTasks = [
        incrementFungibleAssetBalance({
          asset: FungibleAsset.Point,
          amount: pointsPerAction[TransactionLogType.AnswerQuestion],
          transactionLogType: TransactionLogType.AnswerQuestion,
          injectedPrisma: tx,
          questionIds: [request.questionId],
          userId
        }),
      ];

      if (allQuestionOptions.length === allQuestionAnswers.length) {
        fungibleAssetRevealTasks.push(
          incrementFungibleAssetBalance({
            asset: FungibleAsset.Point,
            amount: pointsPerAction[TransactionLogType.AnswerDeck],
            transactionLogType: TransactionLogType.AnswerDeck,
            injectedPrisma: tx,
            deckIds: [request.deckId!],
            userId
          }),
        );

        if (!!deckQuestions[0].deck.date) await updateStreak(userId);
      }

      await Promise.all(fungibleAssetRevealTasks);
    });

    return Response.json({ message: "Answers saved successfully" });
  } catch (error) {
    return new Response("Failed to store answer!", {
      status: 400,
    });
  }
}
