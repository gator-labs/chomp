"use server";

import prisma from "../services/prisma";
import { revalidatePath } from "next/cache";
import { questionSchema } from "../schemas/question";
import { redirect } from "next/navigation";
import { getIsUserAdmin } from "../queries/user";
import { z } from "zod";

export async function createQuestion(data: z.infer<typeof questionSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = questionSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  const questionData = {
    ...validatedFields.data,
    tagIds: undefined,
    questionOptions: undefined,
    id: undefined,
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
    return false;
  }

  if (!data.id) {
    return false;
  }

  const existingTagIds = (
    await prisma.questionTag.findMany({
      where: {
        questionId: data.id,
      },
    })
  ).map((qt) => qt.tagId);

  const questionData = {
    ...validatedFields.data,
    tagIds: undefined,
    questionOptions: undefined,
    id: undefined,
  };

  await prisma.question.update({
    where: {
      id: data.id,
    },
    data: {
      ...questionData,
      questionOptions: {
        deleteMany: {},
        createMany: {
          data: data.questionOptions,
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

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
