"use server";

import {
  BoxPrizeStatus,
  BoxPrizeType,
  BoxTriggerType,
  MysteryBoxStatus,
} from "@prisma/client";

import prisma from "../services/prisma";
import { calculateMysteryBoxReward } from "../utils/algo";
import { getJwtPayload } from "./jwt";

type MysteryBoxProps = {
  triggerType: BoxTriggerType;
  questionIds: number[];
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
    const calculatedReward = await calculateMysteryBoxReward();
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS;
    const res = await prisma.mysteryBox.create({
      data: {
        triggerType,
        userId: userId,
        triggers: {
          createMany: {
            data: questionIds.map((questionId) => ({
              questionId,
            })),
          },
        },
        MysteryBoxPrize: {
          create: {
            status: BoxPrizeStatus.UnClaimed,
            size: calculatedReward.box_type,
            prizeType: BoxPrizeType.Token,
            tokenAddress,
            amount: String(calculatedReward?.bonk),
          },
        },
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
          },
        },
      },
    });
    return res.id;
  } catch (e) {
    console.log(e);
  }
}

export async function openMysteryBox(id: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  try {
    await prisma.mysteryBox.update({
      where: {
        id: id,
      },
      data: {
        status: MysteryBoxStatus.Opened,
        MysteryBoxPrize: {
          update: {
            data: {
              status: BoxPrizeStatus.Claimed,
            },
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}
