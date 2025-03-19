import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { sendBonk } from "@/app/utils/sendBonk";
import { FindMysteryBoxError } from "@/lib/error";
import {
  EBoxTriggerType,
  EChainTxType,
  EMysteryBoxStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { PublicKey } from "@solana/web3.js";
import "server-only";

import { UserAllowlistError } from "./error";

export type FindMysteryBoxResult = {
  id: string;
  status: EMysteryBoxStatus;
};

export async function calculateTotalPrizeTokens(
  userId: string,
  tokenAddress: string,
) {
  const result = (await prisma.$queryRaw`
    SELECT SUM(CAST(amount AS NUMERIC)) FROM
      "MysteryBoxPrize" mbp
      LEFT JOIN "MysteryBoxTrigger" mbt
      ON mbp."mysteryBoxTriggerId" = mbt."id"
      LEFT JOIN
      "MysteryBox" mb
      ON mbt."mysteryBoxId" = mb."id"
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
  type: EChainTxType,
) {
  if (rewardAmount > 0) {
    const sendTx = await sendBonk(
      new PublicKey(address),
      Math.round(rewardAmount * 10 ** 5),
      type,
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
