"use server";

import { QuestionType } from "@prisma/client";
import { z } from "zod";
import prisma from "../services/prisma";
import { revalidatePath } from "next/cache";

const schema = z.object({
  question: z
    .string({
      invalid_type_error: "Invalid question",
      required_error: "Question is required",
    })
    .min(5),
  type: z.nativeEnum(QuestionType),
});

export type CreateQuestionState = {
  errors?: {
    question?: string[];
    type?: string[];
  };
};

export async function createQuestion(
  prevState: CreateQuestionState,
  formData: FormData
) {
  const validatedFields = schema.safeParse({
    question: formData.get("question"),
    type: formData.get("type"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  await prisma.question.create({ data: validatedFields.data });
  revalidatePath("/questions");

  return {};
}
