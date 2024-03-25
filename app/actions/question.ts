"use server";

import prisma from "../services/prisma";
import { revalidatePath } from "next/cache";
import { questionSchema } from "../schemas/question";
import { redirect } from "next/navigation";

export type QuestionFormState = {
  id?: number;
  errors?: {
    question?: string[];
    type?: string[];
  };
};

export async function createQuestion(
  state: QuestionFormState,
  formData: FormData
) {
  const validatedFields = questionSchema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await prisma.question.create({ data: validatedFields.data });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}

export async function editQuestion(
  state: QuestionFormState,
  formData: FormData
) {
  const validatedFields = questionSchema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      ...state,
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await prisma.question.update({
    where: {
      id: state.id,
    },
    data: validatedFields.data,
  });

  revalidatePath("/admin/questions");
  redirect("/admin/questions");
}
