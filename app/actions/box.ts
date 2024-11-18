"use server";

import { BoxTriggerType } from "@prisma/client";

import prisma from "../services/prisma";
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
    await prisma.mysteryBox.create({
      data: {
        triggerType,
        userId: userId,
      },
    });
  } catch (e) {
    console.log(e);
  }
}
