"use server";

import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import { getUsersTotalCreditAmount } from "@/app/queries/home";
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
  totalCreditWon: number;
};

/**
 * Reveals the contents of a mystery box, without actually opening it.
 *
 * @param mysteryBoxId The ID of a mystery box that is owned by the
 *                     authenticated user and in the new state.
 *
 * @param isDismissed Whether the mystery box has been dismissed
 *                    (Reopen).
 *
 * @return mysteryBox  Mystery box contents, or null if unauthorised.
 */
export async function revealMysteryBox(
  mysteryBoxId: string,
  isDismissed: boolean,
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
    let creditsReceived = 0;

    const reward = await prisma.mysteryBox.findUnique({
      where: {
        id: mysteryBoxId,
        userId: payload.sub,
        status: isDismissed
          ? EMysteryBoxStatus.Unopened
          : EMysteryBoxStatus.New,
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
            // We check for Unclaimed/Dismissed status here since boxes may be stuck in
            // Unclaimed state if a previous reveal attempt failed
            status: {
              in: [EBoxPrizeStatus.Unclaimed, EBoxPrizeStatus.Dismissed],
            },
            // OR: [
            //   {
            //     // Until we implement credits and/or other tokens:
            //     prizeType: EBoxPrizeType.Token,
            //     tokenAddress: bonkAddress,
            //   },
            //   { prizeType: EBoxPrizeType.Credits },
            // ],
          },
        },
      },
    });

    if (!reward) throw new Error("Reward not found or not in openable state");

    for (const prize of reward.MysteryBoxPrize) {
      const prizeAmount = Number(prize.amount ?? 0);
      if (prize.prizeType === EBoxPrizeType.Token) {
        if (prize.tokenAddress)
          tokensReceived[prize.tokenAddress] = prizeAmount;

        if (prize.tokenAddress == bonkAddress) bonkReceived = prizeAmount;
      }
      if (prize.prizeType === EBoxPrizeType.Credits) {
        creditsReceived = prizeAmount;
      }
    }

    const oldTotalBonkWon = bonkAddress
      ? await calculateTotalPrizeTokens(payload.sub, bonkAddress)
      : 0;

    const totalBonkWon = new Decimal(oldTotalBonkWon)
      .add(bonkReceived)
      .toNumber();

    const oldTotalCreditWon = await getUsersTotalCreditAmount();

    const totalCreditWon = new Decimal(oldTotalCreditWon)
      .add(creditsReceived)
      .toNumber();

    return {
      mysteryBoxId,
      tokensReceived,
      creditsReceived,
      totalBonkWon,
      totalCreditWon,
    };
  } catch (e) {
    const revealMysteryBoxError = new RevealMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble revealing for Mystery Box: ${mysteryBoxId}`,
      { cause: e },
    );
    Sentry.captureException(revealMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);

    throw new Error("Error revealing mystery box");
  }
}
