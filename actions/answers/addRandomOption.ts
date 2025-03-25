"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";

export async function addRandomOption(
  questionId: number,
  random: number | undefined,
) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const userId = payload.sub;
  const questionAnswer = await prisma.questionAnswer.findMany({
    where: { questionOptionId: random, userId },
  });

  try {
    const res = await prisma.questionAnswer.update({
      where: {
        id: questionAnswer[0].id,
      },
      data: {
        isRandomOption: true,
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
}
