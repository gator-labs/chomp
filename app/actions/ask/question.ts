"use server";

import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { askQuestionSchema } from "@/app/schemas/ask";
import prisma from "@/app/services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { formatErrorsToString } from "@/app/utils/zod";
import { CreateAskQuestionError } from "@/lib/error";
import { QuestionType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getJwtPayload } from "../jwt";

export async function createAskQuestion(
  data: z.infer<typeof askQuestionSchema>,
) {
  const FF_ASK = process.env.NEXT_PUBLIC_FF_ASK === "true";

  if (!FF_ASK) return null;

  const payload = await getJwtPayload();

  if (!payload) return null;

  try {
    const validatedFields = askQuestionSchema.safeParse(data);

    if (!validatedFields.success) {
      return {
        errorMessage: formatErrorsToString(validatedFields),
        success: false,
      };
    }

    const options = validatedFields.data.questionOptions.map((qo, i) =>
      validatedFields.data.type === QuestionType.BinaryQuestion && i == 0
        ? { ...qo, isLeft: true, index: i }
        : { qo, index: 0 },
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
  } catch (e) {
    const createAskQuestionError = new CreateAskQuestionError(
      `User with id: ${payload.sub} is having trouble creating an ask question`,
    );
    Sentry.captureException(createAskQuestionError, {
      level: "fatal",
      extra: {
        data,
        cause: { e },
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);

    revalidatePath("/application/ask");
    return { errorMessage: "Internal error.", success: false };
  }

  revalidatePath("/application/ask");

  return { success: true };
}
