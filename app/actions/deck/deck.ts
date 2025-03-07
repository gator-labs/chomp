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
import {
  handleAddNewQuestionOptionsConcurrently,
  handleUpsertingQuestionOptionsConcurrently,
} from "../question/question";
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

  await prisma.$transaction(
    async (tx) => {
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

      await tx.questionTag.deleteMany({
        where: {
          questionId: {
            in: questionIds,
          },
        },
      });

      await tx.question.deleteMany({
        where: {
          id: {
            in: questionIds,
          },
        },
      });
    },
    { maxWait: 5000 },
  );

  revalidatePath("/admin/decks");
}

export async function copyDeck(deckId: number): Promise<number> {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });

  if (!deck) throw new Error("Deck not found");

  const deckQuestions = await prisma.deckQuestion.findMany({
    where: { deckId },
    include: {
      question: {
        include: {
          questionOptions: true,
          questionTags: true,
        },
      },
    },
  });

  let newDeckId: number | undefined = undefined;

  await prisma.$transaction(async (tx) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...newDeck } = deck;

    newDeck.deck = "Copy of " + newDeck.deck;
    newDeck.activeFromDate = null;
    newDeck.revealAtDate = null;
    newDeck.createdAt = new Date();
    newDeck.updatedAt = new Date();
    newDeck.imageUrl = null;

    const createdDeck = await tx.deck.create({ data: newDeck });

    const now = new Date();

    for (const deckQuestion of deckQuestions) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, question, questionId, ...newDeckQuestion } = deckQuestion;
      const { questionOptions, questionTags, ...newQuestion } = question;

      newQuestion.revealAtDate = null;
      newQuestion.imageUrl = null;

      newDeckQuestion.deckId = createdDeck.id;
      newDeckQuestion.createdAt = now;
      newDeckQuestion.updatedAt = now;

      const questionOptionsData = questionOptions.map((qo) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { questionId, id, ...rest } = qo;
        rest.createdAt = now;
        rest.updatedAt = now;
        return rest;
      });

      const questionTagsData = questionTags.map((qt) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { questionId, id, ...rest } = qt;
        return rest;
      });

      if (newQuestion) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...newQuestionWithoutId } = newQuestion;

        const newData = {
          ...newQuestionWithoutId,
          deckQuestions: { create: newDeckQuestion },
          questionOptions: { create: questionOptionsData },
          questionTags: { create: questionTagsData },
        };

        await tx.question.create({
          data: newData,
        });
      }
    }

    newDeckId = createdDeck.id;
  });

  revalidatePath("/admin/decks");

  if (!newDeckId) throw new Error("Deck not copied");

  return newDeckId;
}

export async function createDeck(data: z.infer<typeof deckSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = deckSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: "Validation failed" };
  }

  if (validatedFields.data.authorImageUrl) {
    const isBucketImageValid = await validateBucketImage(
      validatedFields.data.authorImageUrl.split("/").pop()!,
      validatedFields.data.authorImageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
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
        creditCostPerQuestion: validatedFields.data.creditCostPerQuestion,
        date: validatedFields.data.date,
        activeFromDate: validatedFields.data.activeFromDate,
        stackId: validatedFields.data.stackId,
        description: validatedFields.data.description,
        footer: validatedFields.data.footer,
        heading: validatedFields.data.heading,
        author: validatedFields.data.author,
        authorImageUrl: validatedFields.data.authorImageUrl,
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
          creditCostPerQuestion: validatedFields.data.creditCostPerQuestion,
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
          stackId: validatedFields.data.stackId,
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

  if (!validatedFields.data.id) {
    return { errorMessage: "Deck id not specified" };
  }

  const images = validatedFields.data.questions
    .map((question) => question.imageUrl)
    .filter((image) => !!image);

  //Validate and upload images for question.
  for (let index = 0; index < images.length; index++) {
    const image = images[index]!;

    const isBucketImageValid = await validateBucketImage(
      image.split("/").pop()!,
      image,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
  }

  //Validate and upload images for deck.
  if (validatedFields.data.imageUrl) {
    const isBucketImageValid = await validateBucketImage(
      validatedFields.data.imageUrl.split("/").pop()!,
      validatedFields.data.imageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
  }

  if (validatedFields.data.authorImageUrl) {
    const isBucketImageValid = await validateBucketImage(
      validatedFields.data.authorImageUrl.split("/").pop()!,
      validatedFields.data.authorImageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");
  }

  // New added question in the deck
  const newDeckQuestions = validatedFields.data.questions.filter((q) => !q.id);

  // Retrieve the previous questionIds from the deck without any updates
  const existingQuestionId = (
    await prisma.deckQuestion.findFirst({
      where: {
        deckId: data.id,
      },
    })
  )?.questionId;

  // Retrieve the questions from the deck
  const existingDeckQuestions = validatedFields.data.questions.filter(
    (q) => !!q.id,
  );

  // Retrieve the previous question from the deck without any updates
  const currentDeckQuestions = await prisma.deckQuestion.findMany({
    where: {
      deckId: data.id,
    },
    include: {
      question: {
        include: {
          questionOptions: {
            include: {
              questionAnswers: true,
            },
          },
        },
      },
    },
  });

  const existingQuestionIds = new Set(existingDeckQuestions.map((q) => q.id));

  const isQuestionAnswered = currentDeckQuestions?.some((deckQuestion) =>
    deckQuestion?.question?.questionOptions?.some(
      (option) => option?.questionAnswers && option.questionAnswers.length > 0,
    ),
  );

  for (const question of currentDeckQuestions) {
    const currentQuestion = question.question;
    const existingQuestion = existingDeckQuestions.find(
      (q) => q.id === currentQuestion.id,
    );

    if (
      existingQuestion &&
      currentQuestion.type !== existingQuestion.type &&
      isQuestionAnswered
    ) {
      return {
        errorMessage: "Question type can't be changed if there's an answer.",
      };
    }

    if (
      existingQuestion &&
      currentDeckQuestions.length !== existingDeckQuestions.length &&
      isQuestionAnswered
    ) {
      return {
        errorMessage:
          "Adding/Removing question is not allowed if there's an answer.",
      };
    }

    if (
      existingQuestion &&
      currentQuestion.id !== existingQuestion.id &&
      isQuestionAnswered
    ) {
      return {
        errorMessage: "New question cannot be added if there's an answer.",
      };
    }
  }

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
      // Update deck metadata
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
          creditCostPerQuestion: validatedFields.data.creditCostPerQuestion,
          date: validatedFields.data.date,
          stackId: validatedFields.data.stackId,
          footer: validatedFields.data.footer,
          description: validatedFields.data.description,
          heading: validatedFields.data.heading,
          author: validatedFields.data.author,
          authorImageUrl: validatedFields.data.authorImageUrl,
        },
      });

      // add new questions
      for (const question of newDeckQuestions) {
        await tx.question.create({
          data: {
            question: question.question,
            type: question.type,
            revealToken: validatedFields.data.revealToken,
            revealTokenAmount: validatedFields.data.revealTokenAmount,
            revealAtDate: validatedFields.data.revealAtDate,
            revealAtAnswerCount: validatedFields.data.revealAtAnswerCount,
            creditCostPerQuestion: validatedFields.data.creditCostPerQuestion,
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
            stackId: validatedFields.data.stackId,
          },
          include: {
            deckQuestions: true,
          },
        });
      }

      const deletedQuestions = currentDeckQuestions.filter(
        (dq) => !existingQuestionIds.has(dq.question.id),
      );

      const deletedQuestionOptionsIds = deletedQuestions.flatMap((q) =>
        q.question.questionOptions.map((qo) => qo.id),
      );
      const deletedquestionIds = deletedQuestions.map((q) => q.questionId);

      // Delete image from s3 for current question in the deck
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

        // Change question metadata
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
            creditCostPerQuestion: validatedFields.data.creditCostPerQuestion,
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
            stackId: validatedFields.data.stackId,
          },
        });

        // Change question option metadata
        if (question.id) {
          // Update option metadata for same question type
          if (question.type === validatedQuestion?.question.type) {
            await handleUpsertingQuestionOptionsConcurrently(
              tx,
              question.id,
              question.questionOptions,
            );
          }
          // Add new question options for change in option type
          else {
            await handleAddNewQuestionOptionsConcurrently(
              tx,
              question.id,
              question.questionOptions,
            );
          }
        }
      }

      if (
        deletedQuestionOptionsIds.length === 0 &&
        deletedquestionIds.length === 0
      ) {
        return;
      }

      // delete question data if question is removed
      for (const question of deletedQuestions) {
        if (question?.question.imageUrl) {
          const deleteObject = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET_NAME!,
            Key: question?.question.imageUrl.split("/").pop(),
          });

          await s3Client.send(deleteObject);
        }
      }

      await tx.questionOption.deleteMany({
        where: {
          id: {
            in: deletedQuestionOptionsIds,
          },
        },
      });

      await tx.deckQuestion.deleteMany({
        where: {
          questionId: {
            in: deletedquestionIds,
          },
        },
      });

      await tx.question.deleteMany({
        where: {
          id: {
            in: deletedquestionIds,
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

export async function getTotalNumberOfAnswersInDeck(
  deckId: number,
): Promise<number | null> {
  const res = await prisma.$queryRaw<{ totalNumberOfAnswers: number }[]>`
    SELECT COUNT(DISTINCT CONCAT(qa."userId", '-', q.id)) AS "totalNumberOfAnswers"
    FROM public."DeckQuestion" dq
    JOIN public."Question" q ON q.id = dq."questionId"
    JOIN public."QuestionOption" qo ON qo."questionId" = q.id
    JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
    WHERE dq."deckId" = ${deckId};
  `;

  return res?.[0]?.totalNumberOfAnswers || 0;
}

export async function getTotalNumberOfAnswersInQuestions(
  questionId: number,
): Promise<number | null> {
  const res = await prisma.$queryRaw<{ totalNumberOfAnswers: number }[]>`
    SELECT COUNT(DISTINCT CONCAT(qa."userId", '-', q.id)) AS "totalNumberOfAnswers"
    FROM public."Question" q
    JOIN public."QuestionOption" qo ON qo."questionId" = q.id
    JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
    WHERE q."id" = ${questionId};
  `;

  return res?.[0]?.totalNumberOfAnswers || 0;
}
