import { GetUnopenedMysteryBoxError } from "@/lib/error";
import {
  EBoxPrizeStatus,
  EBoxTriggerType,
  EMysteryBoxStatus,
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
export const isNewUserEligibleForMysteryBox = async () => {
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

  // If the user is new and has not been rewarded, return true; otherwise, return false.
  const hasReward = res.length > 0;

  return isNewUser && !hasReward;
};
