import { getJwtPayload } from "@/app/actions/jwt";
import { getCurrentUser } from "@/app/queries/user";
import prisma from "@/app/services/prisma";
import { calculateMysteryBoxReward } from "@/app/utils/algo";
import { sendBonk } from "@/app/utils/claim";
<<<<<<< HEAD
=======
import { CreateMysteryBoxError } from "@/lib/error";
import { MysteryBoxEventsType } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
} from "@prisma/client";
>>>>>>> PROD-510/protect-mystery-box-endpoints
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
    const calculatedReward = await calculateMysteryBoxReward(
      MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
    );
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          createMany: {
            data: questionIds.map((questionId) => ({
              questionId,
              triggerType,
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
