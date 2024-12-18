"use server";

import { isNewUserEligibleForMysteryBox } from "@/app/queries/mysteryBox";
import prisma from "@/app/services/prisma";
// import { calculateMysteryBoxReward } from "@/app/utils/algo";
import { CreateMysteryBoxError } from "@/lib/error";
// import { MysteryBoxEventsType } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EPrizeSize,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import { getJwtPayload } from "../jwt";

export async function rewardTutorialMysteryBox(): Promise<string | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  try {
    const isEligible = isNewUserEligibleForMysteryBox();
    if (!isEligible) {
      return null;
    }
    // const calculatedReward = await calculateMysteryBoxReward(
    //   MysteryBoxEventsType.TUTORIAL_COMPLETED,
    // );

    // console.log(calculatedReward);

    const calculatedRewardWip = {
      box_type: EPrizeSize.Small,
      credit: 15,
    };

    // if (!calculatedReward?.bonk) throw new Error("No BONK in mystery box");

    const userWallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!userWallet) return null;

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          create: {
            triggerType: EBoxTriggerType.TutorialCompleted,
          },
        },
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: calculatedRewardWip.box_type,
            prizeType: EBoxPrizeType.Credits,
            amount: String(calculatedRewardWip?.credit),
          },
        },
      },
    });
    return res.id;
  } catch (e) {
    console.log(e);

    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating tutorail completion mystery box for User id: ${userId}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    return null;
  }
}
