"use server";

import { DeckImportModel } from "@/app/schemas/deckImport";
import s3Client from "@/app/services/s3Client";
import { validateBucketImage } from "@/app/utils/file";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
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

export async function deleteQuestions(questionIds: number[]) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  await prisma.$transaction(async (tx) => {
    const questions = await tx.question.findMany({
      where: {
        id: {
          in: questionIds,
        },
      },
      include: {
        questionOptions: true,
        deckQuestions: true,
      },
    });

    if (!questions.length) return;

    const qIds = questions.map((q) => q.id);

    const questionOptionsIds = questions.flatMap((q) =>
      q.questionOptions.map((qo) => qo.id),
    );

    await tx.chompResult.deleteMany({
      where: {
        questionId: {
          in: qIds,
        },
      },
    });

    await tx.questionAnswer.deleteMany({
      where: {
        questionOptionId: {
          in: questionOptionsIds,
        },
      },
    });

    await tx.questionOption.deleteMany({
      where: {
        id: {
          in: questionOptionsIds,
        },
      },
    });

    await tx.deckQuestion.deleteMany({
      where: {
        questionId: {
          in: qIds,
        },
      },
    });

    await tx.question.deleteMany({
      where: {
        id: {
          in: qIds,
        },
      },
    });
  });

  revalidatePath("/admin/questions");
}

export async function deleteDeck(deckId: number) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  await prisma.$transaction(async (tx) => {
    const deckQuestions = await tx.deckQuestion.findMany({
      where: {
        deckId,
      },
      include: {
        question: {
          include: {
            questionOptions: true,
          },
        },
      },
    });

    const questionOptionsIds = deckQuestions.flatMap((q) =>
      q.question.questionOptions.map((qo) => qo.id),
    );
    const questionIds = deckQuestions.map((dq) => dq.questionId);

    await tx.chompResult.deleteMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
    });

    await tx.questionAnswer.deleteMany({
      where: {
        questionOptionId: {
          in: questionOptionsIds,
        },
      },
    });

    await tx.questionOption.deleteMany({
      where: {
        id: {
          in: questionOptionsIds,
        },
      },
    });

    await tx.deckQuestion.deleteMany({
      where: {
        deckId,
      },
    });

    await tx.userDeck.deleteMany({
      where: {
        deckId,
      },
    });

    await tx.deck.delete({ where: { id: deckId } });

    await tx.question.deleteMany({
      where: {
        id: {
          in: questionIds,
        },
      },
    });
  });

  revalidatePath("/admin/decks");
}

export async function createDeck(data: z.infer<typeof deckSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: "Validaiton failed" };
  }

  const images = data.questions
    .map((question) => question.imageUrl)
    .filter((image) => !!image);

  for (let index = 0; index < images.length; index++) {
    const image = images[index]!;

    const isBucketImageValid = await validateBucketImage(
      image.split("/").pop()!,
      image,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
  }

  await prisma.$transaction(async (tx) => {
    const deck = await tx.deck.create({
      data: {
        deck: validatedFields.data.deck,
        imageUrl: validatedFields.data.imageUrl,
        revealAtDate: validatedFields.data.revealAtDate,
        revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
        date: validatedFields.data.date,
        activeFromDate: validatedFields.data.activeFromDate,
        campaignId: validatedFields.data.campaignId,
        description: validatedFields.data.description,
        footer: validatedFields.data.footer,
        heading: validatedFields.data.heading,
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
  console.log("IN");
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: formatErrorsToString(validatedFields) };
  }

  if (!validatedFields.data.id) {
    return { errorMessage: "Deck id not specified" };
  }

  const images = validatedFields.data.questions
    .map((question) => question.imageUrl)
    .filter((image) => !!image);

  for (let index = 0; index < images.length; index++) {
    const image = images[index]!;

    const isBucketImageValid = await validateBucketImage(
      image.split("/").pop()!,
      image,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
  }

  if (validatedFields.data.imageUrl) {
    const isBucketImageValid = await validateBucketImage(
      validatedFields.data.imageUrl.split("/").pop()!,
      validatedFields.data.imageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
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

  // ADD DELETE IMAGE

  await prisma.$transaction(
    async (tx) => {
      const deck = await tx.deck.update({
        where: {
          id: data.id,
        },
        data: {
          activeFromDate: validatedFields.data.activeFromDate,
          deck: validatedFields.data.deck,
          imageUrl: validatedFields.data.imageUrl,
          revealAtDate: validatedFields.data.revealAtDate,
          revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
          date: validatedFields.data.date,
          campaignId: validatedFields.data.campaignId,
          footer: validatedFields.data.footer,
          description: validatedFields.data.description,
          heading: validatedFields.data.heading,
        },
      });

      const newDeckQuestions = validatedFields.data.questions.filter(
        (q) => !q.id,
      );

      console.log(newDeckQuestions);

      for (const question of newDeckQuestions) {
        console.log(question);
        const res = await tx.question.create({
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
          include: {
            deckQuestions: true,
          },
        });
      }

      const existingDeckQuestions = validatedFields.data.questions.filter(
        (q) => !!q.id,
      );

      const currentDeckQuestions = await tx.deckQuestion.findMany({
        where: {
          deckId: data.id,
        },
        include: {
          question: true,
        },
      });

      for (const question of existingDeckQuestions) {
        const validatedQuestion = currentDeckQuestions.find(
          (dq) => dq.questionId === question.id,
        );

        if (
          !!validatedQuestion?.question?.imageUrl &&
          question?.imageUrl !== validatedQuestion?.question?.imageUrl
        ) {
          const deleteObject = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: validatedQuestion?.question!.imageUrl!.split("/").pop(),
          });

          await s3Client.send(deleteObject);
        }

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

      // Currently a no-op, but may be needed after deck deletion logic is re-enabled.
      if (
        existingDeckQuestions.length === 0 &&
        currentDeckQuestions.length === 0
      ) {
        return;
      }

      // Temporarily deactivate deck deletion until this logic is rock solid.
      // I saw an issue in testing.
      // await tx.deckQuestion.deleteMany({
      //   where: {
      //     deckId: deck.id,
      //     questionId: {
      //       notIn: existingDeckQuestions.map((q) => q.id) as number[],
      //     },
      //   },
      // });
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

export async function getTotalNumberOfAnswersInDeck(
  deckId: number,
): Promise<number | null> {
  const res = await prisma.$queryRaw<{ totalNumberOfAnswers: number }[]>`
    SELECT COUNT(DISTINCT CONCAT(qa."userId", '-', q.id)) AS "totalNumberOfAnswers"
    FROM "DeckQuestion" dq
    JOIN "Question" q ON q.id = dq."questionId"
    JOIN "QuestionOption" qo ON qo."questionId" = q.id
    JOIN "QuestionAnswer" qa ON qa."questionOptionId" = qo.id
    WHERE dq."deckId" = ${deckId};
  `;

  return res?.[0]?.totalNumberOfAnswers || 0;
}

export async function getTotalNumberOfAnswersInQuestions(
  questionId: number,
): Promise<number | null> {
  const res = await prisma.$queryRaw<{ totalNumberOfAnswers: number }[]>`
    SELECT COUNT(DISTINCT CONCAT(qa."userId", '-', q.id)) AS "totalNumberOfAnswers"
    FROM "Question" q
    JOIN "QuestionOption" qo ON qo."questionId" = q.id
    JOIN "QuestionAnswer" qa ON qa."questionOptionId" = qo.id
    WHERE q."id" = ${questionId};
  `;

  return res?.[0]?.totalNumberOfAnswers || 0;
}
