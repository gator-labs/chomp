"use server";

import { DeckImportModel } from "@/app/schemas/deckImport";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIsUserAdmin } from "../../queries/user";
import { deckSchema } from "../../schemas/deck";
import prisma from "../../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../../utils/dateUtils";
import { formatErrorsToString } from "../../utils/zod";
import { handleUpsertingQuestionOptionsConcurrently } from "../question/question";
import { deckInputFactory } from "./factories";

export async function createDeck(data: z.infer<typeof deckSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: "Validaiton failed" };
  }

  await prisma.$transaction(async (tx) => {
    const deck = await tx.deck.create({
      data: {
        deck: validatedFields.data.deck,
        imageUrl: validatedFields.data.imageUrl,
        revealAtDate: validatedFields.data.revealAtDate,
        revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
        date: validatedFields.data.date,
        isActive: validatedFields.data.isActive,
        campaignId: validatedFields.data.campaignId,
      },
    });

    for (const question of validatedFields.data.questions) {
      await tx.question.create({
        data: {
          question: question.question,
          type: question.type,
          imageUrl: question.imageUrl,
          revealToken: validatedFields.data.revealToken,
          revealTokenAmount: validatedFields.data.revealTokenAmount,
          revealAtDate: validatedFields.data.revealAtDate,
          revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
          durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
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
          campaignId: validatedFields.data.campaignId,
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
    return { errorMessage: formatErrorsToString(validatedFields) };
  }

  if (!data.id) {
    return { errorMessage: "Deck id not specified" };
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
          imageUrl: validatedFields.data.imageUrl,
          revealAtDate: validatedFields.data.revealAtDate,
          revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
          date: validatedFields.data.date,
          campaignId: validatedFields.data.campaignId,
        },
      });

      const newDeckQuestions = validatedFields.data.questions.filter(
        (q) => !q.id,
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
            imageUrl: question.imageUrl,
            durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
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
            campaignId: validatedFields.data.campaignId,
          },
        });
      }

      const existingDeckQuestions = validatedFields.data.questions.filter(
        (q) => !!q.id,
      );

      for (const question of existingDeckQuestions) {
        await tx.question.update({
          where: {
            id: question.id,
          },
          data: {
            question: question.question,
            type: question.type,
            imageUrl: question.imageUrl,
            revealToken: validatedFields.data.revealToken,
            revealTokenAmount: validatedFields.data.revealTokenAmount,
            revealAtDate: validatedFields.data.revealAtDate,
            revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
            questionTags: {
              createMany: {
                data: validatedFields.data.tagIds
                  .filter((tagId) => !existingTagIds.includes(tagId))
                  .map((tagId) => ({ tagId })),
              },
              deleteMany: {
                tagId: {
                  in: existingTagIds.filter(
                    (tagId) => !validatedFields.data.tagIds.includes(tagId),
                  ),
                },
              },
            },
            campaignId: validatedFields.data.campaignId,
          },
        });

        if (question.id) {
          await handleUpsertingQuestionOptionsConcurrently(
            tx,
            question.id,
            question.questionOptions,
          );
        }
      }

      await tx.deckQuestion.deleteMany({
        where: {
          deckId: deck.id,
          questionId: {
            notIn: existingDeckQuestions.map((q) => q.id) as number[],
          },
        },
      });
    },
    { timeout: 20000 },
  );

  revalidatePath("/admin/decks");
  redirect("/admin/decks");
}

export async function handleInsertDecks(decksToAdd: DeckImportModel[]) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  await prisma.$transaction(async (tx) => {
    const deckAndQuestions = deckInputFactory(decksToAdd);
    const deckQuestionPromises = deckAndQuestions.map(
      async ({ deck, questions }) => {
        const deckSaved = await tx.deck.create({ data: deck });
        const questionsSaved = await Promise.all(
          questions.map(
            async (question) => await tx.question.create({ data: question }),
          ),
        );

        const deckQuestionPromises = questionsSaved.map(async (q) => {
          await tx.deckQuestion.create({
            data: { deckId: deckSaved.id, questionId: q.id },
          });
        });

        await Promise.all(deckQuestionPromises);
      },
    );

    await Promise.all(deckQuestionPromises);
  });

  revalidatePath("/admin/decks");
  redirect("/admin/decks");
}
