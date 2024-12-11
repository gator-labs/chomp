"use server";

import { RevealMysteryBoxError } from "@/lib/error";
import { calculateTotalPrizeTokens } from "@/lib/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EMysteryBoxStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import Decimal from "decimal.js";

import prisma from "../../services/prisma";
import { getJwtPayload } from "../jwt";

export type MysteryBoxResult = {
  mysteryBoxId: string;
  tokensReceived: Record<string, number>; // token address -> amount
  creditsReceived: number;
  totalBonkWon: number;
};

/**
 * Reveals the contents of a mystery box, without actually opening it.
 *
 * @param mysteryBoxId The ID of a mystery box that is owned by the
 *                     authenticated user and in the new state.
 *
 * @return mysteryBox  Mystery box contents, or null if unauthorised.
 */
export async function revealMysteryBox(
  mysteryBoxId: string,
): Promise<MysteryBoxResult | null> {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const tokensReceived: Record<string, number> = {};

  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  // A wallet is required for opening, so
  // we might as well deny here.
  if (!userWallet) {
    return null;
  }

  try {
    let bonkReceived = 0;
    const creditsReceived = 0;

    const reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
        userId: payload.sub,
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
            status: EBoxPrizeStatus.Unclaimed,
            // Until we implement credits and/or other tokens:
            prizeType: EBoxPrizeType.Token,
            tokenAddress: bonkAddress,
          },
        },
      },
    });

    if (!reward) throw new Error("Reward not found or not in openable state");

    for (const prize of reward.MysteryBoxPrize) {
      if (prize.prizeType != EBoxPrizeType.Token) continue;

      const prizeAmount = Number(prize.amount ?? 0);

      if (prize.tokenAddress) tokensReceived[prize.tokenAddress] = prizeAmount;

      if (prize.tokenAddress == bonkAddress) bonkReceived = prizeAmount;
    }

    const oldTotalBonkWon = bonkAddress
      ? await calculateTotalPrizeTokens(payload.sub, bonkAddress)
      : 0;

    const totalBonkWon = new Decimal(oldTotalBonkWon)
      .add(bonkReceived)
      .toNumber();

    return {
      mysteryBoxId,
      tokensReceived,
      creditsReceived,
      totalBonkWon,
    };
  } catch (e) {
    const revealMysteryBoxError = new RevealMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble revealing for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(revealMysteryBoxError);

    throw new Error("Error revealing mystery box");
  }
}
