"use server";

import {
  CreateMysteryBoxError,
  DismissMysteryBoxError,
  OpenMysteryBoxError,
  SendBonkError,
} from "@/lib/error";
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

export type MysteryBoxResult = {
  mysteryBoxId: string;
  tokensReceived: number;
  creditsReceived: number;
  transactionSignature: string | null;
  totalBonkWon: number;
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
    const calculatedReward = await calculateMysteryBoxReward(
      MysteryBoxEventsType.CLAIM_ALL_COMPLETED,
    );
    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";
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

    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating ${triggerType} mystery box for User id: ${payload.sub} and questions ids: ${questionIds}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    return null;
  }
}

export async function openMysteryBox(
  mysteryBoxId: string,
): Promise<MysteryBoxResult | null> {
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
      release();
      return null;
    }

    const sendTx = await handleSendBonk(
      Number(reward?.MysteryBoxPrize[0]?.amount),
      userWallet.address,
    );

    if (!sendTx) {
      const sendBonkError = new SendBonkError(
        `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble opening for Mystery Box: ${mysteryBoxId}`,
        { cause: "Failed to send bonk" },
      );
      Sentry.captureException(sendBonkError);
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

    const totalBonkWon = await calculateTotalPrizeTokens(
      payload.sub,
      process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "",
    );

    release();
    revalidatePath("/application");

    return {
      mysteryBoxId,
      tokensReceived: Number(reward?.MysteryBoxPrize[0]?.amount ?? 0),
      creditsReceived: 0,
      transactionSignature: sendTx,
      totalBonkWon,
    };
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
}

export async function dismissMysteryBox(mysteryBoxId: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  try {
    await prisma.$transaction(async (tx) => {
      const updated = await tx.mysteryBox.update({
        where: {
          id: mysteryBoxId,
          status: EMysteryBoxStatus.New,
          userId: payload.sub,
        },
        data: {
          status: EMysteryBoxStatus.Unopened,
        },
      });

      if (updated) {
        await tx.mysteryBoxPrize.updateMany({
          where: {
            mysteryBoxId: mysteryBoxId,
            status: EBoxPrizeStatus.Unclaimed,
          },
          data: {
            status: EBoxPrizeStatus.Dismissed,
          },
        });
      }
    });
  } catch (e) {
    console.log(e);

    const dismissMysteryBoxError = new DismissMysteryBoxError(
      `Failed to dismiss mysterybox: user: ${payload.sub}, mysteryBoxId: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(dismissMysteryBoxError);

    throw new Error("Error dmismissing mystery box");
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
