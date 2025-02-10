"use server";

import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { DismissMysteryBoxError } from "@/lib/error";
import { EBoxPrizeStatus, EMysteryBoxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import prisma from "../../services/prisma";
import { getJwtPayload } from "../jwt";

/**
 * Dismisses a mystery box - a user signals that they don't wish
 * to immediately open a box that is presented to them. This is
 * an explicit refusal, as opposed to just navigating away.
 *
 * @param mysteryBoxId The box to dismiss. Must be owned by the
 *                     user and in the New state.
 */
export async function dismissMysteryBox(mysteryBoxId: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.mysteryBox.update({
        where: {
          id: mysteryBoxId,
          status: EMysteryBoxStatus.New,
          userId: payload.sub,
        },
        data: {
          status: EMysteryBoxStatus.Unopened,
        },
        include: {
          triggers: {
            select: {
              MysteryBoxPrize: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      if (updated) {
        const allPrizes = updated.triggers.flatMap(
          (trigger) => trigger.MysteryBoxPrize,
        );
        await tx.mysteryBoxPrize.updateMany({
          where: {
            id: {
              in: allPrizes.map((prize) => prize.id),
            },
            status: EBoxPrizeStatus.Unclaimed,
          },
          data: {
            status: EBoxPrizeStatus.Dismissed,
          },
        });
      }
    });
  } catch (e) {
    console.log(e);

    const dismissMysteryBoxError = new DismissMysteryBoxError(
      `Failed to dismiss mysterybox: user: ${payload.sub}, mysteryBoxId: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(dismissMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);

    throw new Error("Error dismissing mystery box");
  }
}
