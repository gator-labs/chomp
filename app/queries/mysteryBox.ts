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
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
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
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }
};

/**
 * Retrieves the mystery box ID for a new user if they are eligible.
 *
 * This function checks if the user is new and if they have completed the tutorial.
 * If the user is new and has not yet triggered the tutorial completion mystery box,
 * it rewards them with a mystery box and returns its ID.
 *
 * @returns {Promise<string | null>} The ID of the rewarded mystery box if the user is eligible, otherwise null.
 */
export const getNewUserMysteryBoxId = async (): Promise<string | null> => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }
  const userId = payload.sub;
  const isNewUser = payload?.new_user;
  const res = await prisma.mysteryBox.findFirst({
    where: {
      userId,
      triggers: { some: { triggerType: EBoxTriggerType.TutorialCompleted } },
    },
  });

  const FF_MYSTERY_BOX = Boolean(
    process.env.NEXT_PUBLIC_FF_MYSTERY_BOX_NEW_USER === "true",
  );

  const isEligible = Boolean(isNewUser && !res && FF_MYSTERY_BOX);
  if (isEligible) {
    const mysteryBoxId = await rewardTutorialMysteryBox(userId);
    return mysteryBoxId;
  }
  return null;
};

/**
 * Rewards a user with a tutorial completion mystery box.
 *
 * @param userId - The ID of the user to reward.
 * @returns A promise that resolves to the ID of the created mystery box, or null if the user wallet is not found or an error occurs.
 *
 * @throws {CreateMysteryBoxError} If there is an error creating the mystery box.
 */
async function rewardTutorialMysteryBox(
  userId: string,
): Promise<string | null> {
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
