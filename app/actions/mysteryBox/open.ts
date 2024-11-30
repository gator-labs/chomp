"use server";

import { OpenMysteryBoxError, SendBonkError } from "@/lib/error";
import {
  calculateTotalPrizeTokens,
  sendBonkFromTreasury,
} from "@/lib/mysteryBox";
import { EBoxPrizeStatus, EMysteryBoxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import prisma from "../../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../../utils/dateUtils";
import { acquireMutex } from "../../utils/mutex";
import { getJwtPayload } from "../jwt";

export type MysteryBoxResult = {
  mysteryBoxId: string;
  tokensReceived: number;
  creditsReceived: number;
  transactionSignature: string | null;
  totalBonkWon: number;
};

export async function openMysteryBox(
  mysteryBoxId: string,
): Promise<MysteryBoxResult | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: payload.sub },
  });

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  try {
    const reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    });

    if (!userWallet) {
      release();
      return null;
    }

    const sendTx = await sendBonkFromTreasury(
      Number(reward?.MysteryBoxPrize[0]?.amount),
      userWallet.address,
    );

    if (!sendTx) {
      const sendBonkError = new SendBonkError(
        `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble opening for Mystery Box: ${mysteryBoxId}`,
        { cause: "Failed to send bonk" },
      );
      Sentry.captureException(sendBonkError);
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.mysteryBoxPrize.update({
          where: {
            id: reward?.MysteryBoxPrize[0].id,
          },
          data: {
            status: EBoxPrizeStatus.Claimed,
            claimHash: sendTx,
            claimedAt: new Date(),
          },
        });
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );

    await prisma.mysteryBox.update({
      where: {
        id: mysteryBoxId,
      },
      data: {
        status: EMysteryBoxStatus.Opened,
      },
    });

    const totalBonkWon = await calculateTotalPrizeTokens(
      payload.sub,
      process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "",
    );

    release();
    revalidatePath("/application");

    return {
      mysteryBoxId,
      tokensReceived: Number(reward?.MysteryBoxPrize[0]?.amount ?? 0),
      creditsReceived: 0,
      transactionSignature: sendTx,
      totalBonkWon,
    };
  } catch (e) {
    try {
      await prisma.mysteryBox.update({
        where: {
          id: mysteryBoxId,
        },
        data: {
          status: EMysteryBoxStatus.Unopened,
        },
      });
    } catch (e) {
      Sentry.captureException(e);
    }

    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble claiming for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);

    throw new Error("Error opening mystery box");
  } finally {
    release();
  }
}
