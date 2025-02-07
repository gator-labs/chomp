"use server";

import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { OpenMysteryBoxError } from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EChainTxType,
  EMysteryBoxStatus,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

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
        status: EMysteryBoxStatus.New,
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
            prizeType: {
              in: [EBoxPrizeType.Token, EBoxPrizeType.Credits],
            },
          },
        },
      },
    });
  } catch (e) {
    release();

    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for Mystery Box Hub with mysteryboxIds ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);
    throw new Error("Error opening mystery box");
  }

  if (!rewards) {
    release();
    throw new Error("Reward not found or not in openable state");
  }

  let totalBonkAmount = 0;
  let totalCreditAmount = 0;

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS || "";

  try {
    const allPrizes = rewards.flatMap((item) => item.MysteryBoxPrize);
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
    let txHash = null;
    if (totalBonkAmount > 0) {
      txHash = await sendBonkFromTreasury(totalBonkAmount, userWallet.address);
      if (!txHash) {
        release();
        throw new Error("Tx failed");
      }
    }

    await prisma.$transaction(
      async (tx) => {
        const txDate = new Date();

        await tx.fungibleAssetTransactionLog.createMany({
          data: creditPrizes.map((prize) => ({
            type: TransactionLogType.MysteryBox,
            asset: FungibleAsset.Credit,
            change: prize?.amount,
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
              solAmount: "0",
              tokenAmount: totalBonkAmount.toString(),
              tokenAddress: bonkAddress,
              finalizedAt: txDate,
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
            claimedAt: txDate,
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
            claimedAt: new Date(),
          },
        });

        await tx.mysteryBox.updateMany({
          where: {
            id: {
              in: mysteryBoxIds,
            },
          },
          data: {
            status: EMysteryBoxStatus.Opened,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );

    release();
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
          in: rewards
            .flatMap((item) => item.MysteryBoxPrize)
            .map((item) => item.id),
        },
      },
      data: {
        status: EBoxPrizeStatus.Unclaimed,
      },
    });

    Sentry.captureException(e);
    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble claiming for Mystery Box: ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);

    throw new Error("Error opening mystery box");
  } finally {
    release();
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  return {
    totalCreditAmount,
    totalBonkAmount,
  };
};
