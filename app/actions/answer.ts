"use server";

import { AnswerStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { addUserTutorialTimestamp } from "../queries/user";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export async function addTutorialPoints() {
  await addUserTutorialTimestamp();
  revalidatePath("/tutorial");
}
export async function markQuestionAsTimedOut(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await prisma.questionAnswer.updateMany({
      where: {
        userId,
        questionOptionId: {
          in: questionOptions.map((qo) => qo.id),
        },
      },
      data: {
        status: AnswerStatus.TimedOut,
      },
    });
  } catch {
    return { hasError: true };
  }
}

export async function markQuestionAsSkipped(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;

  const questionOptions = await prisma.questionOption.findMany({
    where: { questionId },
  });

  try {
    await prisma.questionAnswer.updateMany({
      where: {
        userId,
        questionOptionId: {
          in: questionOptions.map((qo) => qo.id),
        },
      },
      data: {
        status: AnswerStatus.Skipped,
      },
    });
  } catch {
    return { hasError: true };
  }
}
