"use server";

import { EBoxTriggerType, EMysteryBoxStatus } from "@prisma/client";

import prisma from "../../services/prisma";
import { getJwtPayload } from "../jwt";

/**
 * If a user has an existing new Reveal All Completed box, return
 * it, else null
 *
 * @param questionIds Array of question IDs for the trigger.
 *
 * @return mysteryBoxId New Mystery Box ID
 */
export async function getRevealAllMysteryBoxForQuestions(
  questionIds: number[],
): Promise<string | null> {
  const payload = await getJwtPayload();

  if (!payload) return null;

  const mysteryBox = await prisma.mysteryBox.findFirst({
    where: {
      userId: payload.sub,
      triggers: {
        some: {
          triggerType: EBoxTriggerType.RevealAllCompleted,
          questionId: { in: questionIds },
        },
      },
      status: EMysteryBoxStatus.New,
    },
  });

  if (mysteryBox) return mysteryBox.id;

  return null;
}
