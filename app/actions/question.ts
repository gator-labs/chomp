"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { questionSchema } from "../schemas/question";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILISECONDS } from "../utils/dateUtils";

export async function createQuestion(data: z.infer<typeof questionSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = questionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: "Validaiton failed" };
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
    return { errorMessage: "Validaiton failed" };
  }

  if (!data.id) {
    return { errorMessage: "Id not specified" };
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

    const questionOptionUpsertPromiseArray = data.questionOptions.map((qo) => {
      return tx.questionOption.upsert({
        create: {
          isTrue: qo.isTrue,
          option: qo.option,
          questionId: data.id ?? 0,
        },
        update: {
          isTrue: qo.isTrue,
          option: qo.option,
        },
        where: {
          id: qo.id,
        },
      });
    });

    await Promise.all(questionOptionUpsertPromiseArray);
  });
  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
