import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxReward } from "@/app/utils/algo";
import { sendBonk } from "@/app/utils/claim";
import { CreateMysteryBoxError, FindMysteryBoxError } from "@/lib/error";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { PublicKey } from "@solana/web3.js";
import "server-only";

import { UserAllowlistError } from "./error";

export type FindMysteryBoxResult = {
  id: string;
  status: EMysteryBoxStatus;
};

type MysteryBoxPrize = {
  status: EBoxPrizeStatus;
  size: EPrizeSize;
  prizeType: EBoxPrizeType;
  tokenAddress: string | null;
  amount: string;
};

export async function calculateTotalPrizeTokens(
  userId: string,
  tokenAddress: string,
) {
  const result = (await prisma.$queryRaw`
    SELECT SUM(CAST(amount AS NUMERIC)) FROM
      "MysteryBoxPrize" mbp
      LEFT JOIN
      "MysteryBox" mb
      ON mbp."mysteryBoxId" = mb."id"
      WHERE mb."userId" = ${userId}
      AND mbp."prizeType" = 'Token'
      AND mbp."status" = 'Claimed'
      AND mbp."tokenAddress" = ${tokenAddress}
    `) as { sum: number }[];

  return result?.[0]?.sum ?? 0;
}

export async function sendBonkFromTreasury(
  rewardAmount: number,
  address: string,
) {
  if (rewardAmount > 0) {
    const sendTx = await sendBonk(
      new PublicKey(address),
      Math.round(rewardAmount * 10 ** 5),
    );

    return sendTx;
  }

  return null;
}

export async function isUserInAllowlist(): Promise<boolean> {
  const payload = await getJwtPayload();

  if (!payload) {
    return false;
  }

  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  try {
    const allowlist = await prisma.mysteryBoxAllowlist.findFirst({
      where: {
        address: {
          in: user?.wallets.map((wallet) => wallet.address) || [],
        },
      },
    });

    return !!allowlist;
  } catch (error) {
    const checkUserInAllowlistError = new UserAllowlistError(
      `Failed to check if user with id: ${payload.sub} is in the allowlist`,
      { cause: error },
    );
    Sentry.captureException(checkUserInAllowlistError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return false;
  }
}

/**
 * Gives the currently authenticated user a mystery box.
 *
 * @param userId      User who gets the mystery box.
 * @param triggerType Trigger type.
 * @param questionIds Array of question IDs for the trigger.
 */
export async function rewardMysteryBox(
  userId: string,
  triggerType: EBoxTriggerType,
  questionIds: number[],
) {
  try {
    let calculatedReward;

    if (triggerType == EBoxTriggerType.RevealAllCompleted) {
      calculatedReward = await calculateMysteryBoxReward(
        MysteryBoxEventsType.CLAIM_ALL_COMPLETED, // TODO: Change to RevealAllCompleted when mech-engine is updated
      );
    } else {
      throw new Error(`Unimplemented trigger type: ${triggerType}`);
    }

    const userWallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!userWallet) return null;

    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const prizes: MysteryBoxPrize[] = [];

    if (calculatedReward?.bonk) {
      prizes.push({
        status: EBoxPrizeStatus.Unclaimed,
        size: calculatedReward.box_type,
        prizeType: EBoxPrizeType.Token,
        tokenAddress,
        amount: String(calculatedReward?.bonk),
      });
    }

    // Add credits prize if present
    if (calculatedReward?.credits) {
      prizes.push({
        status: EBoxPrizeStatus.Unclaimed,
        size: calculatedReward.box_type,
        prizeType: EBoxPrizeType.Credits,
        tokenAddress: null,
        amount: String(calculatedReward?.credits),
      });
    }

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          createMany: {
            data: questionIds.map((questionId) => ({
              questionId,
              triggerType,
              mysteryBoxAllowlistId: null,
            })),
          },
        },
        MysteryBoxPrize: {
          create: prizes,
        },
      },
    });
    return res.id;
  } catch (e) {
    console.log(e);

    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating ${triggerType} mystery box for User id: ${userId} and questions ids: ${questionIds}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }
}

/**
 * Returns the ID of an existing mystery box if the user has one.
 *
 * @param userId      User who gets the mystery box.
 * @param triggerType Trigger type.
 */
export async function findMysteryBox(
  userId: string,
  triggerType: EBoxTriggerType,
): Promise<FindMysteryBoxResult | null> {
  try {
    const box = await prisma.mysteryBox.findFirst({
      where: {
        userId,
        triggers: { some: { triggerType } },
      },
      include: {
        triggers: true,
      },
    });

    if (!box?.id) return null;

    return {
      id: box.id,
      status: box.status,
    };
  } catch (e) {
    const findMysteryBoxError = new FindMysteryBoxError(
      `User with id: ${userId}: failed to check Mystery Box status`,
      { cause: e },
    );
    Sentry.captureException(findMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);

    return null;
  }
}
