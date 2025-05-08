"use server";

import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { OpenMysteryBoxError } from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import { FungibleAsset, TransactionLogType } from "@prisma/client";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EChainTxStatus,
  EChainTxType,
  EMysteryBoxStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import pRetry from "p-retry";

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
 * @param mysteryBoxId The ID of a mystery box that is owed by the
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

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS || "";

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
        triggers: {
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
                prizeType: {
                  in: [EBoxPrizeType.Token, EBoxPrizeType.Credits],
                },
              },
            },
          },
        },
      },
    });
  } catch (e) {
    release();

    const openMysteryBoxError = new OpenMysteryBoxError(
      `Failed to find prize for user ${payload.sub} (wallet: ${userWallet.address}) for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError, {
      extra: {
        mysteryBoxId,
        userId: payload.sub,
        walletAddress: userWallet.address,
        error: e,
      },
    });
    throw new Error("Error opening mystery box");
  }

  if (!reward) {
    release();
    throw new Error("Reward not found or not in openable state");
  }

  try {
    for (const prize of reward.triggers[0].MysteryBoxPrize) {
      const prizeAmount = Number(prize.amount ?? 0);
      let sendTx: string | null;

      if (prize.prizeType == EBoxPrizeType.Token) {
        if (prizeAmount > 0 && prize.tokenAddress === bonkAddress) {
          sendTx = await sendBonkFromTreasury(
            prizeAmount,
            userWallet.address,
            EChainTxType.MysteryBoxClaim,
          );

          if (!sendTx) {
            throw new Error("Send bonk transaction failed");
          } else {
            txHashes[prize.tokenAddress] = sendTx;
          }
        }
      }

      await pRetry(
        async () => {
          await prisma.$transaction(
            async (tx) => {
              const txDate = new Date();

              if (prize.prizeType == EBoxPrizeType.Credits) {
                await tx.fungibleAssetTransactionLog.create({
                  data: {
                    type: TransactionLogType.MysteryBox,
                    asset: FungibleAsset.Credit,
                    change: prize.amount,
                    userId: payload.sub,
                    mysteryBoxPrizeId: prize.id,
                  },
                });
              }

              if (sendTx) {
                const treasury = await getTreasuryAddress();

                if (!treasury) throw new Error("Treasury address not defined");

                await tx.chainTx.create({
                  data: {
                    hash: sendTx,
                    wallet: treasury,
                    recipientAddress: userWallet.address,
                    type: EChainTxType.MysteryBoxClaim,
                    status: EChainTxStatus.Finalized,
                    solAmount: "0",
                    tokenAmount: prizeAmount.toString(),
                    tokenAddress: bonkAddress,
                    finalizedAt: txDate,
                  },
                });
              }

              await tx.mysteryBoxPrize.update({
                where: {
                  id: prize.id,
                },
                data: {
                  status: EBoxPrizeStatus.Claimed,
                  claimHash: sendTx,
                  claimedAt: txDate,
                },
              });
            },
            {
              isolationLevel: "Serializable",
              timeout: ONE_MINUTE_IN_MILLISECONDS,
            },
          );
        },
        {
          retries: 2,
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
      `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError, {
      extra: {
        mysteryBoxId,
        userId: payload.sub,
        walletAddress: userWallet.address,
        prizeId: reward.triggers[0].MysteryBoxPrize[0].id,
        error: e,
      },
    });
    throw new Error("Error processing mystery box prizes");
  } finally {
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    release();
  }

  return txHashes;
}
