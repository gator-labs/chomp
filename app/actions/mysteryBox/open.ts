"use server";

import { OpenMysteryBoxError, SendBonkError } from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EMysteryBoxStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import prisma from "../../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../../utils/dateUtils";
import { acquireMutex } from "../../utils/mutex";
import { getJwtPayload } from "../jwt";

export type TokenTxHashes = Record<string, string>;
export type MysteryBoxRewardRewardTxHashes = TokenTxHashes;

/**
 * Opens a previously-rewarded mystery box
 *
 * Currently we refuse to open dismissed boxes or prizes in the
 * "unopened" state (boxes start as "new").
 *
 * @param mysteryBoxId The ID of a mystery box that is owned by the
 *                     authenticated user and in the new state.
 *
 * @param isDismissed Whether the mystery box has been dismissed
 *                    (Reopen).
 *
 * @return tokenTxHashes Map of tx hashes for each rewarded token
 *                       (if any), or null if user is not
 *                       authenticated / has no wallet address.
 *                       A tx hash is not guaranteed even if tokens
 *                       were in the box (e.g. if the tx failed).
 */
export async function openMysteryBox(
  mysteryBoxId: string,
  isDismissed: boolean,
): Promise<TokenTxHashes | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const txHashes: Record<string, string> = {};

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS;

  const release = await acquireMutex({
    identifier: "OPEN_MYSTERY_BOX",
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

  let reward;

  try {
    reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
        userId: payload.sub,
        status: isDismissed
          ? EMysteryBoxStatus.Unopened
          : EMysteryBoxStatus.New,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
            prizeType: true,
            amount: true,
            tokenAddress: true,
          },
          where: {
            // We check for Unclaimed/Dismissed status here since boxes may be stuck in
            // Unclaimed state if a previous reveal attempt failed
            status: {
              in: [EBoxPrizeStatus.Unclaimed, EBoxPrizeStatus.Dismissed],
            },
            prizeType: EBoxPrizeType.Token,
          },
        },
      },
    });
  } catch (e) {
    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble claiming for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);

    throw new Error("Error opening mystery box");
  } finally {
    release();
  }

  if (!reward) throw new Error("Reward not found or not in openable state");

  try {
    for (const prize of reward.MysteryBoxPrize) {
      if (
        prize.prizeType != EBoxPrizeType.Token ||
        prize.tokenAddress != bonkAddress
      )
        throw new Error(
          `Don't know how to send prize for mystery box ${mysteryBoxId}, type ${prize.prizeType} token ${prize.tokenAddress}`,
        );

      const prizeAmount = Number(prize.amount ?? 0);

      let sendTx: string | null;

      if (prizeAmount > 0) {
        sendTx = await sendBonkFromTreasury(prizeAmount, userWallet.address);

        if (!sendTx) {
          const sendBonkError = new SendBonkError(
            `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble opening for Mystery Box: ${mysteryBoxId}`,
            { cause: "Failed to send bonk" },
          );
          Sentry.captureException(sendBonkError);
        }
      } else {
        sendTx = null;
      }

      if (sendTx) txHashes[prize.tokenAddress] = sendTx;

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

    release();
    revalidatePath("/application");
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

  return txHashes;
}
