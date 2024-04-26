"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { questionSchema } from "../schemas/question";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILISECONDS } from "../utils/dateUtils";
import { PrismaTransactionalClient } from "../utils/prisma";
import { formatErrorsToString } from "../utils/zod";

export async function createQuestion(data: z.infer<typeof questionSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = questionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: formatErrorsToString(validatedFields) };
  }

  const questionData = {
    ...validatedFields.data,
    tagIds: undefined,
    questionOptions: undefined,
    id: undefined,
    durationMiliseconds: ONE_MINUTE_IN_MILISECONDS,
  };

  await prisma.question.create({
    data: {
      ...questionData,
      questionOptions: {
        createMany: {
          data: validatedFields.data.questionOptions,
        },
      },
      questionTags: {
        createMany: {
          data: validatedFields.data.tagIds.map((tagId) => ({ tagId })),
        },
      },
    },
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function editQuestion(data: z.infer<typeof questionSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }
  const validatedFields = questionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: formatErrorsToString(validatedFields) };
  }

  if (!data.id) {
    return { errorMessage: "Question id not specified" };
  }

  const existingTagIds = (
    await prisma.questionTag.findMany({
      select: {
        tagId: true,
      },
      where: {
        questionId: data.id,
      },
    })
  ).map((qt) => qt.tagId);

  const questionData = {
    ...validatedFields.data,
    tagIds: undefined,
    durationMiliseconds: ONE_MINUTE_IN_MILISECONDS,
    questionOptions: undefined,
    id: undefined,
  };

  delete questionData.questionOptions;

  await prisma.$transaction(async (tx) => {
    await tx.question.update({
      where: {
        id: data.id,
      },
      data: {
        ...questionData,
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

    if (data.id) {
      await handleUpsertingQuestionOptionsConcurrently(
        tx,
        data.id,
        data.questionOptions,
      );
    }
  });
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function handleUpsertingQuestionOptionsConcurrently(
  tx: PrismaTransactionalClient,
  questionId: number,
  questionOptions: {
    option: string;
    id?: number | undefined;
    isCorrect?: boolean | undefined;
    isLeft?: boolean | undefined;
  }[],
) {
  const questionOptionUpsertPromiseArray = questionOptions.map((qo) => {
    return tx.questionOption.upsert({
      create: {
        isCorrect: qo.isCorrect,
        option: qo.option,
        isLeft: qo.isLeft,
        questionId: questionId,
      },
      update: {
        isCorrect: qo.isCorrect,
        isLeft: qo.isLeft,
        option: qo.option,
      },
      where: {
        id: qo.id,
      },
    });
  });

  await Promise.all(questionOptionUpsertPromiseArray);
}
