import { getJwtPayload } from "@/app/actions/jwt";
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
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { Keypair } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import "server-only";

import { UserAllowlistError } from "./error";

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
  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  if (rewardAmount > 0) {
    const sendTx = await sendBonk(
      treasuryWallet,
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

    if (triggerType == EBoxTriggerType.ClaimAllCompleted) {
      calculatedReward = await calculateMysteryBoxReward(
        MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
      );
    } else {
      throw new Error(`Unimplemented trigger type: ${triggerType}`);
    }

    const userWallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!userWallet) return null;

    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
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
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: calculatedReward.box_type,
            prizeType: EBoxPrizeType.Token,
            tokenAddress,
            amount: String(calculatedReward?.bonk),
          },
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
    return null;
  }
}

/**
 * Gives the currently authenticated user a mystery box.
 *
 * @param userId      User who gets the mystery box.
 * @param triggerType Trigger type.
 *
 * @return mysteryBoxId New box ID.
 */
export async function rewardChompmasBox(
  userId: string,
): Promise<string | null> {
  try {
    const calculatedReward = await calculateMysteryBoxReward(
      MysteryBoxEventsType.CHOMPMAS,
    );

    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const userWallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!userWallet) return null;

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          create: {
            triggerType: EBoxTriggerType.ChompmasStreakAttained,
            mysteryBoxAllowlistId: userWallet.address,
          },
        },
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: calculatedReward.box_type,
            prizeType: EBoxPrizeType.Token,
            tokenAddress,
            amount: String(calculatedReward?.bonk),
          },
        },
      },
    });
    return res.id;
  } catch (e) {
    console.log(e);

    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating Chompmas mystery box for User id: ${userId}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    return null;
  }
}

/**
 * Returns the ID of an existing unclaimed mystery box if
 * the user has one.
 *
 * @param userId      User who gets the mystery box.
 * @param triggerType Trigger type.
 */
export async function findMysteryBox(
  userId: string,
  triggerType: EBoxTriggerType,
): Promise<string | null> {
  try {
    const box = await prisma.mysteryBox.findFirst({
      where: {
        userId,
        status: EMysteryBoxStatus.New,
      },
      include: {
        MysteryBoxPrize: {
          where: {
            status: EBoxPrizeStatus.Unclaimed,
          },
        },
        triggers: {
          where: {
            triggerType,
          },
        },
      },
    });

    return box?.id ?? null;
  } catch (e) {
    const findMysteryBoxError = new FindMysteryBoxError(
      `User with id: ${userId}: failed to check Mystery Box status`,
      { cause: e },
    );
    Sentry.captureException(findMysteryBoxError);

    return null;
  }
}

/**
 * If a user has an existing unopened Chompmas box, return
 * it, else reward one and return the ID.
 *
 * @param userId        User ID.
 * @param longestStreak User's current longest streak (assumed to already
 *                      be validated).
 *
 * @return mysteryBoxId New or existing mystery box ID.
 */
export async function getChompmasMysteryBox(
  userId: string,
  longestStreak: number,
): Promise<string | null> {
  const mysteryBoxId = await findMysteryBox(
    userId,
    EBoxTriggerType.ChompmasStreakAttained,
  );

  if (mysteryBoxId) return mysteryBoxId;

  // We only check this after looking for an existing box so a user
  // doesn't lose their already-awarded box.
  if (longestStreak < Number(process.env.CHOMPMAS_MIN_STREAK ?? 7)) return null;

  return await rewardChompmasBox(userId);
}
