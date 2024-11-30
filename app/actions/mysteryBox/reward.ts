"use server";

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

export type MysteryBoxResult = {
  mysteryBoxId: string;
  tokensReceived: number;
  creditsReceived: number;
  transactionSignature: string | null;
  totalBonkWon: number;
};

export async function rewardMysteryBox({
  triggerType,
  questionIds,
}: MysteryBoxProps) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload?.sub ?? "";

  try {
    const calculatedReward = await calculateMysteryBoxReward(
      MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
    );
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
    const res = await prisma.mysteryBox.create({
      data: {
        userId: userId,
        triggers: {
          createMany: {
            data: questionIds.map((questionId) => ({
              questionId,
              triggerType,
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
