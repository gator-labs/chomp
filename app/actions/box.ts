"use server";

import {
  BoxPrizeStatus,
  BoxPrizeType,
  BoxSize,
  BoxTriggerType,
} from "@prisma/client";

import prisma from "../services/prisma";
import { calculateMysteryBoxReward } from "../utils/algo";
import { getJwtPayload } from "./jwt";

type MysteryBoxProps = {
  triggerType: BoxTriggerType;
};

export async function rewardMysteryBox({ triggerType }: MysteryBoxProps) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload?.sub ?? "";

  try {
    const res = await prisma.mysteryBox.create({
      data: {
        triggerType,
        userId: userId,
      },
    });

    const calculatedReward = await calculateMysteryBoxReward();

    const prize = await prisma.mysteryBoxPrize.create({
      data: {
        mysteryBoxId: res.id, // Ensure res.id exists and is correct
        status: BoxPrizeStatus.UnClaimed, // Assuming the status is always 'UnClaimed' for now
        size: BoxSize.Medium,
        prizeType: BoxPrizeType.Token,
        amount: String(calculatedReward?.bonk),
      },
    });
    return prize.id;
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
    await prisma.mysteryBoxPrize.update({
      where: {
        id: id,
      },
      data: {
        status: BoxPrizeStatus.Claimed,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
