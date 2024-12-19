import { CreateMysteryBoxError, GetUnopenedMysteryBoxError } from "@/lib/error";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";

/**
 * Get an unopened mystery box for a user
 *
 * @returns The mystery box ID or null if no mystery box is found.
 */
export const getUnopenedMysteryBox = async (
  triggerType: EBoxTriggerType,
): Promise<string | null> => {
  const payload = await authGuard();

  try {
    const mysteryBox = await prisma.mysteryBox.findFirst({
      where: {
        userId: payload.sub,
        status: EMysteryBoxStatus.Unopened,
        triggers: { some: { triggerType } },
      },
      include: {
        MysteryBoxPrize: {
          where: {
            // We check for Unclaimed/Dismissed status here since boxes may be stuck in
            // Unclaimed state if a previous reveal attempt failed
            status: {
              in: [EBoxPrizeStatus.Dismissed, EBoxPrizeStatus.Unclaimed],
            },
          },
        },
      },
    });

    return mysteryBox?.id ?? null;
  } catch (error) {
    const getUnopenedMysteryBoxError = new GetUnopenedMysteryBoxError(
      `Error getting unopened mystery box for user id: ${payload.sub}`,
      { cause: error },
    );
    Sentry.captureException(getUnopenedMysteryBoxError);
    return null;
  }
};
export const getNewUserMysterBoxId = async () => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }
  const isNewUser = payload?.new_user;
  const res = await prisma.mysteryBoxTrigger.findMany({
    where: {
      triggerType: EBoxTriggerType.TutorialCompleted,
    },
  });

  const isEligible = isNewUser && res.length === 0;
  if (isEligible) {
    const mysteryBoxId = await rewardTutorialMysteryBox();
    return mysteryBoxId;
  }
  return null;
};

async function rewardTutorialMysteryBox(): Promise<string | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  try {
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
