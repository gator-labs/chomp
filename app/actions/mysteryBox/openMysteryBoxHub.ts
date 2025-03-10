"use server";

import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { OpenMysteryBoxHubError } from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EChainTxStatus,
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

  let txHash: string | null = null;
  try {
    if (totalBonkAmount > 0) {
      txHash = await sendBonkFromTreasury(totalBonkAmount, userWallet.address);
      if (!txHash) {
        throw new Error("Send bonk transaction failed");
      }
    }

    await prisma.$transaction(
      async (tx) => {
        const date = new Date();

        // Step 2: Create chain transaction if txHash is provided
        if (txHash) {
          const treasury = await getTreasuryAddress();

          if (!treasury) {
            throw new Error("Treasury address not defined");
          }

          await tx.chainTx.update({
            data: {
              status: EChainTxStatus.Finalized,
              finalizedAt: date,
            },
            where: {
              hash: txHash,
            },
          });
        }

        // Step 3: Update mystery box prizes for token prizes
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

        // Step 4: Update mystery box prizes for credit prizes
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

        await tx.mysteryBox.updateMany({
          where: {
            id: {
              in: rewards.map((r) => r.id),
            },
            userId: userId,
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
    // TEMP FIX: Create fungible asset transaction logs
    await prisma.fungibleAssetTransactionLog.createMany({
      data: creditPrizes.map((prize) => ({
        type: TransactionLogType.MysteryBox,
        asset: FungibleAsset.Credit,
        change: prize.amount.toString(),
        userId: payload.sub,
        mysteryBoxPrizeId: prize.id,
      })),
    });
  } catch (e) {
    // TEMP FIX: disable rollback
    // try {
    //   await prisma.$transaction(
    //     async (tx) => {
    //       await tx.mysteryBox.updateMany({
    //         where: {
    //           id: {
    //             in: rewards.map((r) => r.id),
    //           },
    //           userId: userId,
    //         },
    //         data: {
    //           status: EMysteryBoxStatus.Unopened,
    //         },
    //       });

    //       await tx.mysteryBoxPrize.updateMany({
    //         where: {
    //           id: {
    //             in: allPrizes.map((prize) => prize.id),
    //           },
    //         },
    //         data: {
    //           status: EBoxPrizeStatus.Unclaimed,
    //         },
    //       });
    //     },
    //     {
    //       isolationLevel: "Serializable",
    //       timeout: ONE_MINUTE_IN_MILLISECONDS,
    //     },
    //   );
    // } catch (error) {
    //   const openMysteryBoxHubError = new OpenMysteryBoxHubError(
    //     `Trouble rolling back data with User id: ${payload.sub} (wallet: ${userWallet.address}) for Mystery Boxes: ${mysteryBoxIds}`,
    //     { cause: error },
    //   );
    //   Sentry.captureException(openMysteryBoxHubError, {
    //     extra: {
    //       mysteryBoxIds,
    //       userId: payload.sub,
    //       walletAddress: userWallet.address,
    //       prizesIds: allPrizes.map((prize) => prize.id),
    //       txHash,
    //       error,
    //     },
    //   });
    // }
    const openMysteryBoxHubError = new OpenMysteryBoxHubError(
      `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for Mystery Boxes: ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxHubError, {
      extra: {
        mysteryBoxIds,
        rewardsMbIdList: rewards.map((r) => r.id),
        userId: payload.sub,
        walletAddress: userWallet.address,
        prizesIds: allPrizes.map((prize) => prize.id),
        txHash,
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
