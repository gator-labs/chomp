"use server";

import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
} from "@prisma/client";

import prisma from "../services/prisma";
import { calculateMysteryBoxReward } from "../utils/algo";
import { getJwtPayload } from "./jwt";

type MysteryBoxProps = {
  triggerType: EBoxTriggerType;
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
  }
}

export async function openMysteryBox(id: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  try {
    const mysteryBox = await prisma.mysteryBox.findUnique({
      where: {
        id: id,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
          },
        },
      },
    });
    await prisma.mysteryBox.update({
      where: {
        id: id,
      },
      data: {
        status: EMysteryBoxStatus.Opened,
        MysteryBoxPrize: {
          update: {
            where: {
              id: mysteryBox?.MysteryBoxPrize[0].id,
            },
            data: {
              status: EBoxPrizeStatus.Claimed,
            },
          },
        },
      },
    });
  } catch (e) {
    console.log(e);
  }
}
