"use server";

import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { OpenMysteryBoxHubError } from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EChainTxStatus,
  EChainTxType,
  EMysteryBoxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import pRetry from "p-retry";

import { SENTRY_FLUSH_WAIT } from "../../constants/sentry";
import prisma from "../../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../../utils/dateUtils";
import { acquireMutex } from "../../utils/mutex";
import { getJwtPayload } from "../jwt";

export const openMysteryBoxHub = async (mysteryBoxIds: string[]) => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const release = await acquireMutex({
    identifier: "OPEN_MYSTERY_BOX_HUB",
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

  let rewards;

  try {
    rewards = await prisma.mysteryBox.findMany({
      where: {
        id: {
          in: mysteryBoxIds,
        },
        userId,
        status: { in: [EMysteryBoxStatus.New, EMysteryBoxStatus.Unopened] },
      },

      include: {
        triggers: {
          select: {
            MysteryBoxPrize: {
              select: {
                id: true,
                prizeType: true,
                amount: true,
                tokenAddress: true,
              },
              where: {
                prizeType: {
                  in: [EBoxPrizeType.Token, EBoxPrizeType.Credits],
                },
                status: {
                  in: [EBoxPrizeStatus.Unclaimed, EBoxPrizeStatus.Dismissed],
                },
              },
            },
          },
        },
      },
    });
  } catch (e) {
    release();

    const openMysteryBoxHubError = new OpenMysteryBoxHubError(
      `Failed to find prize for user ${payload.sub} (wallet: ${userWallet.address}) for Mystery Boxes: ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxHubError);
    throw new Error("Error opening mystery box");
  }

  if (!rewards) {
    release();
    throw new Error("Reward not found or not in openable state");
  }

  let totalBonkAmount = 0;
  let totalCreditAmount = 0;
  const allPrizes = rewards.flatMap((item) =>
    item.triggers.flatMap((trigger) => trigger.MysteryBoxPrize),
  );

  const tokenPrizes = allPrizes.filter(
    (prize) => prize.prizeType === EBoxPrizeType.Token,
  );

  const creditPrizes = allPrizes.filter(
    (prize) => prize.prizeType === EBoxPrizeType.Credits,
  );

  totalBonkAmount = tokenPrizes.reduce(
    (acc, prize) => acc + parseFloat(prize.amount),
    0,
  );

  totalCreditAmount = creditPrizes.reduce(
    (acc, prize) => acc + parseFloat(prize.amount),
    0,
  );

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS || "";

  try {
    let txHash = null;
    if (totalBonkAmount > 0) {
      txHash = await sendBonkFromTreasury(totalBonkAmount, userWallet.address);
      if (!txHash) {
        release();
        throw new Error("Send bonk transaction failed");
      }
    }

    await pRetry(
      async () => {
        await prisma.$transaction(
          async (tx) => {
            const date = new Date();

            await tx.fungibleAssetTransactionLog.createMany({
              data: creditPrizes.map((prize) => ({
                type: TransactionLogType.MysteryBox,
                asset: FungibleAsset.Credit,
                change: prize.amount.toString(),
                userId: payload.sub,
                mysteryBoxPrizeId: prize.id,
              })),
            });

            if (txHash) {
              const treasury = await getTreasuryAddress();

              if (!treasury) throw new Error("Treasury address not defined");

              await tx.chainTx.create({
                data: {
                  hash: txHash,
                  wallet: treasury,
                  recipientAddress: userWallet.address,
                  type: EChainTxType.MysteryBoxClaim,
                  status: EChainTxStatus.Finalized,
                  solAmount: "0",
                  tokenAmount: totalBonkAmount.toString(),
                  tokenAddress: bonkAddress,
                  finalizedAt: date,
                },
              });
            }

            await tx.mysteryBoxPrize.updateMany({
              where: {
                id: {
                  in: tokenPrizes.map((item) => item.id),
                },
              },
              data: {
                status: EBoxPrizeStatus.Claimed,
                claimHash: txHash,
                claimedAt: date,
              },
            });

            await tx.mysteryBoxPrize.updateMany({
              where: {
                id: {
                  in: creditPrizes.map((item) => item.id),
                },
              },
              data: {
                status: EBoxPrizeStatus.Claimed,
                claimedAt: date,
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

    await prisma.mysteryBox.updateMany({
      where: {
        id: {
          in: mysteryBoxIds,
        },
      },
      data: {
        status: EMysteryBoxStatus.Opened,
      },
    });
  } catch (e) {
    await prisma.mysteryBox.updateMany({
      where: {
        id: {
          in: mysteryBoxIds,
        },
      },
      data: {
        status: EMysteryBoxStatus.Unopened,
      },
    });

    await prisma.mysteryBoxPrize.updateMany({
      where: {
        id: {
          in: allPrizes.map((prize) => prize.id),
        },
      },
      data: {
        status: EBoxPrizeStatus.Unclaimed,
      },
    });

    const openMysteryBoxHubError = new OpenMysteryBoxHubError(
      `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for Mystery Boxes: ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxHubError, {
      extra: {
        mysteryBoxIds,
        userId: payload.sub,
        walletAddress: userWallet.address,
        prizesIds: allPrizes.map((prize) => prize.id),
        error: e,
      },
    });

    throw new Error("Error processing mystery box prizes");
  } finally {
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    release();
  }

  return {
    totalCreditAmount,
    totalBonkAmount,
  };
};
