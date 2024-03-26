"use server";

import prisma from "../services/prisma";
import { revalidatePath } from "next/cache";
import { questionSchema } from "../schemas/question";
import { redirect } from "next/navigation";
import { getIsUserAdmin } from "../queries/user";

export type QuestionFormState = {
  id?: number;
  errors?: {
    question?: string[];
    type?: string[];
    revealToken?: string[];
    revealTokenAmount?: string[];
    revealAtDate?: string[];
    revealAtAnswerCount?: string[];
    tags?: string[];
  };
};

export async function createQuestion(
  state: QuestionFormState,
  formData: FormData
) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = questionSchema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
    revealToken: formData.get("revealToken"),
    revealTokenAmount: Number(formData.get("revealTokenAmount")),
    revealAtDate: formData.get("revealAtDate")
      ? new Date(formData.get("revealAtDate")?.toString() || "")
      : null,
    revealAtAnswerCount: formData.get("revealAtAnswerCount")
      ? Number(formData.get("revealAtAnswerCount"))
      : null,
    tags: formData.getAll("tag[]").map(Number),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const questionData = { ...validatedFields.data, tags: undefined };

  await prisma.question.create({
    data: {
      ...questionData,
      questionTags: {
        createMany: {
          data: validatedFields.data.tags.map((tagId) => ({ tagId })),
        },
      },
    },
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function editQuestion(
  state: QuestionFormState,
  formData: FormData
) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = questionSchema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
    revealToken: formData.get("revealToken"),
    revealTokenAmount: Number(formData.get("revealTokenAmount")),
    revealAtDate: formData.get("revealAtDate")
      ? new Date(formData.get("revealAtDate")?.toString() || "")
      : null,
    revealAtAnswerCount: formData.get("revealAtAnswerCount")
      ? Number(formData.get("revealAtAnswerCount"))
      : null,
    tags: formData.getAll("tag[]").map(Number),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const existingTags = (
    await prisma.questionTag.findMany({
      where: {
        questionId: state.id,
      },
    })
  ).map((qt) => qt.tagId);

  const questionData = { ...validatedFields.data, tags: undefined };

  await prisma.question.update({
    where: {
      id: state.id,
    },
    data: {
      ...questionData,
      questionTags: {
        createMany: {
          data: validatedFields.data.tags
            .filter((tagId) => !existingTags.includes(tagId))
            .map((tagId) => ({ tagId })),
        },
        deleteMany: {
          tagId: {
            in: existingTags.filter(
              (tagId) => !validatedFields.data.tags.includes(tagId)
            ),
          },
        },
      },
    },
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
