"use server";

import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { deckSchema } from "../schemas/deck";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getJwtPayload } from "./jwt";
import { QuestionAnswer } from "@prisma/client";
import prisma from "../services/prisma";

export type SaveDeckRequest = {
  questionId: number;
  questionOptionId: number;
  percentageGiven?: number;
  percentageGivenForAnswerId?: number;
};

export async function saveDeck(request: SaveDeckRequest[], deckId: number) {
  const payload = await getJwtPayload();
  const questionIds = request.map((dr) => dr.questionId);
  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId: { in: questionIds } },
  });

  const questionAnswers = questionOptions.map(
    (qo) =>
      ({
        percentage:
          request.find((r) => r.questionOptionId === qo.id)?.percentageGiven ??
          0,
        selected: request.some((r) => r.questionOptionId === qo.id),
        questionOptionId: qo.id,
        userId: payload?.sub ?? "",
      }) as QuestionAnswer
  );

  prisma.$transaction(async (tx) => {
    await tx.userDeck.create({
      data: {
        deckId: deckId,
        userId: payload?.sub ?? "",
      },
    });
    await tx.questionAnswer.createMany({
      data: questionAnswers,
    });
  });
}

export async function createDeck(data: z.infer<typeof deckSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  await prisma.$transaction(async (tx) => {
    const deck = await prisma.deck.create({
      data: {
        deck: validatedFields.data.deck,
      },
    });

    for (const question of validatedFields.data.questions) {
      await prisma.question.create({
        data: {
          question: question.question,
          type: question.type,
          revealToken: validatedFields.data.revealToken,
          revealTokenAmount: validatedFields.data.revealTokenAmount,
          revealAtDate: validatedFields.data.revealAtDate,
          revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
          deckQuestions: {
            create: {
              deckId: deck.id,
            },
          },
          questionOptions: {
            createMany: {
              data: question.questionOptions,
            },
          },
          questionTags: {
            createMany: {
              data: validatedFields.data.tagIds.map((tagId) => ({ tagId })),
            },
          },
        },
      });
    }
  });

  revalidatePath("/admin/decks");
  redirect("/admin/decks");
}
