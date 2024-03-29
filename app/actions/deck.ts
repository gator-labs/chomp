"use server";

import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { deckSchema } from "../schemas/deck";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILISECONDS } from "../utils/dateUtils";

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
          durationMiliseconds: ONE_MINUTE_IN_MILISECONDS,
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
