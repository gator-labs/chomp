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

/**
 * Opens a previously-rewarded mystery box
 *
 * Currently we refuse to open dismissed boxes or prizes in the
 * "unopened" state (boxes start as "new").
 *
 * @param mysteryBoxId The ID of a mystery box that is owned by the
 *                     authenticated user and in the new state.
 */
export async function openMysteryBox(
  mysteryBoxId: string,
): Promise<MysteryBoxResult | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS;

  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: payload.sub },
  });

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  if (!userWallet) {
    release();
    return null;
  }

  try {
    let bonkReceived = 0;
    let bonkTx = null;

    const reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
        userId: payload.sub,
        status: EMysteryBoxStatus.New,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
            amount: true,
            tokenAddress: true,
          },
          where: {
            status: EBoxPrizeStatus.Unclaimed,
          },
        },
      },
    });

    if (!reward) throw new Error("Reward not found or not in openable state");

    for (const prize of reward.MysteryBoxPrize) {
      if (prize.tokenAddress != bonkAddress)
        throw new Error(
          `Don't know how to send prize for mystery box ${mysteryBoxId}, token ${prize.tokenAddress}`,
        );

      const prizeAmount = Number(prize.amount);

      const sendTx = await sendBonkFromTreasury(
        prizeAmount,
        userWallet.address,
      );

      if (!sendTx) {
        const sendBonkError = new SendBonkError(
          `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble opening for Mystery Box: ${mysteryBoxId}`,
          { cause: "Failed to send bonk" },
        );
        Sentry.captureException(sendBonkError);
      }

      bonkReceived = prizeAmount;
      bonkTx = sendTx;

      await prisma.$transaction(
        async (tx) => {
          await tx.mysteryBoxPrize.update({
            where: {
              id: prize.id,
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
    }

    await prisma.mysteryBox.update({
      where: {
        id: mysteryBoxId,
      },
      data: {
        status: EMysteryBoxStatus.Opened,
      },
    });

    const totalBonkWon = bonkAddress
      ? await calculateTotalPrizeTokens(payload.sub, bonkAddress)
      : 0;

    release();
    revalidatePath("/application");

    return {
      mysteryBoxId,
      tokensReceived: bonkReceived,
      creditsReceived: 0,
      transactionSignature: bonkTx,
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
