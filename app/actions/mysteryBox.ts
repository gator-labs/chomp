"use server";

import { ClaimMysteryBoxError } from "@/lib/error";
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
import { revalidatePath } from "next/cache";

import prisma from "../services/prisma";
import { calculateMysteryBoxReward } from "../utils/algo";
import { sendBonk } from "../utils/claim";
import { ONE_MINUTE_IN_MILLISECONDS } from "../utils/dateUtils";
import { acquireMutex } from "../utils/mutex";
import { getJwtPayload } from "./jwt";

type MysteryBoxProps = {
  triggerType: EBoxTriggerType;
  questionIds: number[];
};

export async function rewardMysteryBox({
  triggerType,
  questionIds,
}: MysteryBoxProps) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload?.sub ?? "";

  try {
    const calculatedReward = await calculateMysteryBoxReward();
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS;
    const res = await prisma.mysteryBox.create({
      data: {
        userId: userId,
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
    return null;
  }
}

export async function openMysteryBox(mysteryBoxId: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: payload.sub },
  });

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  try {
    const reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
            amount: true,
          },
        },
      },
    });

    if (!userWallet) {
      return;
    }

    const sendTx = await handleSendBonk(
      Number(reward?.MysteryBoxPrize[0]?.amount),
      userWallet.address,
    );

    if (!sendTx) {
      throw new Error(
        `Failed to send BONK reward of Mystery box for userId: ${payload.sub}, wallet: ${userWallet.address}, amount: ${reward?.MysteryBoxPrize[0]?.amount} BONK`,
      );
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.mysteryBoxPrize.update({
          where: {
            id: reward?.MysteryBoxPrize[0].id,
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

    return {
      mysteryBoxId,
      rewardAmount: Number(reward?.MysteryBoxPrize[0]?.amount),
      transactionSignature: sendTx,
    };
  } catch (e) {
    await prisma.mysteryBox.update({
      where: {
        id: mysteryBoxId,
      },
      data: {
        status: EMysteryBoxStatus.Unopened,
      },
    });
    const claimMysteryBoxError = new ClaimMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble claiming for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(claimMysteryBoxError);
    throw e;
  } finally {
    release();
  }
}

export async function handleSendBonk(rewardAmount: number, address: string) {
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
