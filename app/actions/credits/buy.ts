"use server";

import prisma from "@/app/services/prisma";
import { sleep } from "@/app/utils/sleep";
import { FungibleAsset, Prisma, TransactionLogType } from "@prisma/client";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

import { getJwtPayload } from "../jwt";

export async function createBuyCreidtsTx(deckId: number) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const creditForQuestion = await prisma.deck.findMany({
    where: {
      id: deckId,
    },
    select: {
      creditCostPerQuestion: true,
      deckQuestions: true,
    },
  });

  if (
    !creditForQuestion[0].creditCostPerQuestion ||
    creditForQuestion[0].deckQuestions.length < 1 ||
    process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT === null
  ) {
    throw new Error("Error preaparing the tx");
  }

  const deckCost =
    creditForQuestion[0].creditCostPerQuestion *
    creditForQuestion[0].deckQuestions.length;

  const solAmount =
    Number(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT) * Number(deckCost);

  const wallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
    select: {
      address: true,
    },
  });

  if (!wallet) {
    throw new Error("Error preaparing the tx");
  }

  const fromWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  const treasuryAddress = fromWallet.publicKey.toString();

  const { randomUUID } = require("crypto");
  const newChainTx = await prisma.chainTx.create({
    data: {
      hash: randomUUID(), // Temporary hash that will be replaced with actual tx hash
      status: "New",
      solAmount: String(solAmount),
      wallet: wallet?.address,
      feeSolAmount: "0",
      recipientAddress: treasuryAddress,
      type: "CreditPurchase",
    },
  });

  // stimulate submitting tx
  await sleep(5000);

  await updateTransactionLog(newChainTx.hash, deckCost, payload.sub);
}

const updateTransactionLog = async (
  hash: string,
  deckCost: number,
  userId: string,
) => {
  const maxRetries = 6; // retry for 1 minute (6 attempts * 10 seconds)
  const delayMs = 10000; // 10 seconds
  let attempt = 0;
  let success = false;

  while (attempt < maxRetries && !success) {
    attempt++;
    try {
      await prisma.fungibleAssetTransactionLog.create({
        data: {
          chainTxHash: hash,
          asset: FungibleAsset.Credit,
          change: deckCost,
          userId: userId,
          type: TransactionLogType.CreditPurchase,
        },
      });
      success = true;
    } catch (error) {
      console.error(`updateTransactionLog failed (attempt ${attempt}):`, error);

      if (attempt < maxRetries) {
        // wait for delayMs before next retry
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        // If all retries failed
        throw new Error(
          "Unable to update the transaction log after multiple attempts. Please contact support.",
        );
      }
    }
  }
};
