"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { deckSchema } from "../schemas/deck";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILISECONDS } from "../utils/dateUtils";

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
    return { errorMessage: "Validaiton failed" };
  }

  if (!data.id) {
    return { errorMessage: "Id not specified" };
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
          },
        });

        const questionOptionPromiseArray = question.questionOptions.map(
          (qo) => {
            return tx.questionOption.upsert({
              create: {
                isTrue: qo.isTrue,
                option: qo.option,
                questionId: question.id ?? 0,
              },
              update: {
                isTrue: qo.isTrue,
                option: qo.option,
              },
              where: {
                id: qo.id,
              },
            });
          },
        );

        await Promise.all(questionOptionPromiseArray);
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
