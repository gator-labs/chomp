"use server";

import { DismissMysteryBoxError } from "@/lib/error";
import { EBoxPrizeStatus, EMysteryBoxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import prisma from "../../services/prisma";
import { getJwtPayload } from "../jwt";

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
      });

      if (updated) {
        await tx.mysteryBoxPrize.updateMany({
          where: {
            mysteryBoxId: mysteryBoxId,
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

    throw new Error("Error dmismissing mystery box");
  }
}
