"use server";

import prisma from "@/app/services/prisma";
import { sleep } from "@/app/utils/sleep";
import {
  EChainTxStatus,
  EChainTxType,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
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

  const newChainTx = await prisma.chainTx.create({
    data: {
      status: EChainTxStatus.New,
      solAmount: String(solAmount),
      wallet: wallet?.address,
      feeSolAmount: "0",
      recipientAddress: treasuryAddress,
      type: EChainTxType.CreditPurchase,
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
  await prisma.fungibleAssetTransactionLog.create({
    data: {
      chainTxHash: hash,
      asset: FungibleAsset.Credit,
      change: deckCost,
      userId: userId,
      type: TransactionLogType.CreditPurchase,
    },
  });
};
