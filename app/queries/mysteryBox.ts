"use server";

import { GetUnopenedMysteryBoxError } from "@/lib/error";
import {
  EBoxPrizeStatus,
  EBoxTriggerType,
  EMysteryBoxStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";

/**
 * Get an unopened mystery box for a user
 *
 * @returns The mystery box ID or null if no mystery box is found.
 */
export const getUnopenedMysteryBox = async (
  triggerType: EBoxTriggerType[],
): Promise<string | null> => {
  const payload = await authGuard();

  try {
    const mysteryBox = await prisma.mysteryBox.findFirst({
      where: {
        userId: payload.sub,
        status: EMysteryBoxStatus.Unopened,
        triggers: { some: { triggerType: { in: triggerType } } },
      },
      include: {
        triggers: {
          select: {
            triggerType: true,
            MysteryBoxPrize: {
              where: {
                status: {
                  // We check for Unclaimed/Dismissed status here since boxes may be stuck in
                  // Unclaimed state if a previous reveal attempt failed
                  in: [EBoxPrizeStatus.Dismissed, EBoxPrizeStatus.Unclaimed],
                },
              },
              select: {
                id: true,
                prizeType: true,
                amount: true,
                tokenAddress: true,
                claimedAt: true,
              },
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
