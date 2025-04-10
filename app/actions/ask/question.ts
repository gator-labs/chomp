"use server";

import { askQuestionSchema } from "@/app/schemas/ask";
import prisma from "@/app/services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { formatErrorsToString } from "@/app/utils/zod";
import { QuestionType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getJwtPayload } from "../jwt";

export async function createAskQuestion(
  data: z.infer<typeof askQuestionSchema>,
) {
  const payload = await getJwtPayload();

  if (!payload) return null;
  const validatedFields = askQuestionSchema.safeParse(data);

  if (!validatedFields.success) {
    return { errorMessage: formatErrorsToString(validatedFields) };
  }

  const options = validatedFields.data.questionOptions.map((qo, i) =>
    validatedFields.data.type === QuestionType.BinaryQuestion && i == 0
      ? { ...qo, isLeft: true }
      : qo,
  );

  const questionData = {
    ...validatedFields.data,
    tagIds: undefined,
    questionOptions: undefined,
    id: undefined,
    durationMiliseconds: ONE_MINUTE_IN_MILLISECONDS,
    isSubmittedByUser: true,
    createdByUserId: payload.sub,
  };

  await prisma.question.create({
    data: {
      ...questionData,
      questionOptions: {
        createMany: {
          data: options,
        },
      },
    },
  });

  revalidatePath("/application/ask");
}
