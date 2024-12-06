"use server";

import { getCurrentUser } from "@/app/queries/user";
import { CreateMysteryBoxError } from "@/lib/error";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import prisma from "../../services/prisma";
import { calculateMysteryBoxReward } from "../../utils/algo";
import { getJwtPayload } from "../jwt";

type MysteryBoxProps = {
  triggerType: EBoxTriggerType;
  questionIds: number[];
};

/**
 * Gives the currently authenticated user a mystery box.
 *
 * @param triggerType Trigger type.
 * @param questionIds Array of question IDs for the trigger.
 */
export async function rewardMysteryBox({
  triggerType,
  questionIds,
}: MysteryBoxProps) {
  const payload = await getJwtPayload();
  const user = await getCurrentUser();

  if (!payload) {
    return null;
  }

  try {
    const calculatedReward = await calculateMysteryBoxReward(
      MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
    );
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
    const res = await prisma.mysteryBox.create({
      data: {
        userId: payload.sub,
        triggers: {
          createMany: {
            data: questionIds.map((questionId) => ({
              questionId,
              triggerType,
              mysteryBoxAllowlistId: user?.wallets[0].address ?? "",
            })),
          },
        },
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: calculatedReward.box_type,
            prizeType: EBoxPrizeType.Token,
            tokenAddress,
            amount: String(calculatedReward?.bonk),
          },
        },
      },
    });
    return res.id;
  } catch (e) {
    console.log(e);

    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating ${triggerType} mystery box for User id: ${payload.sub} and questions ids: ${questionIds}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    return null;
  }
}
