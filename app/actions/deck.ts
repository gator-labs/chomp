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
    const deck = await tx.deck.create({
      data: {
        deck: validatedFields.data.deck,
        revealAtDate: validatedFields.data.revealAtDate,
        revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
      },
    });

    for (const question of validatedFields.data.questions) {
      await tx.question.create({
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

export async function editDeck(data: z.infer<typeof deckSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  if (!data.id) {
    return false;
  }

  const existingQuestionId = (
    await prisma.deckQuestion.findFirst({
      where: {
        deckId: data.id,
      },
    })
  )?.questionId;

  const existingTagIds = (
    await prisma.questionTag.findMany({
      where: {
        questionId: existingQuestionId,
      },
    })
  ).map((qt) => qt.tagId);

  await prisma.$transaction(
    async (tx) => {
      const deck = await tx.deck.update({
        where: {
          id: data.id,
        },
        data: {
          deck: validatedFields.data.deck,
          revealAtDate: validatedFields.data.revealAtDate,
          revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
        },
      });

      // TODO: optimize so only modified questions get updated

      const newDeckQuestions = validatedFields.data.questions.filter(
        (q) => !q.id
      );

      for (const question of newDeckQuestions) {
        await tx.question.create({
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

      const existingDeckQuestions = validatedFields.data.questions.filter(
        (q) => !!q.id
      );

      for (const question of existingDeckQuestions) {
        await tx.question.update({
          where: {
            id: question.id,
          },
          data: {
            question: question.question,
            type: question.type,
            revealToken: validatedFields.data.revealToken,
            revealTokenAmount: validatedFields.data.revealTokenAmount,
            revealAtDate: validatedFields.data.revealAtDate,
            revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
            questionOptions: {
              deleteMany: {},
              createMany: {
                data: question.questionOptions.map((option) => ({
                  ...option,
                  id: undefined,
                })),
              },
            },
            questionTags: {
              createMany: {
                data: validatedFields.data.tagIds
                  .filter((tagId) => !existingTagIds.includes(tagId))
                  .map((tagId) => ({ tagId })),
              },
              deleteMany: {
                tagId: {
                  in: existingTagIds.filter(
                    (tagId) => !validatedFields.data.tagIds.includes(tagId)
                  ),
                },
              },
            },
          },
        });
      }

      const questionsToDelete = await tx.deckQuestion.findMany({
        where: {
          deckId: deck.id,
          questionId: {
            notIn: existingDeckQuestions.map((q) => q.id) as number[],
          },
        },
      });

      // TODO: add cascade to question and then implement this
      questionsToDelete.length && console.log({ questionsToDelete });
    },
    { timeout: 20000 }
  );

  revalidatePath("/admin/decks");
  redirect("/admin/decks");
}
