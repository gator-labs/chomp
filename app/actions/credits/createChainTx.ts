"use server";

import prisma from "@/app/services/prisma";
import { getTreasuryPrivateKey } from "@/lib/env-vars";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

import { getJwtPayload } from "../jwt";
import { updateTransactionLog } from "./updateTxLog";

/**
 * Create a new chainTx - Save the entry in chain tx table when
 * user initiate credit purchase and sign the transaction
 *
 * @param creditsToBuy The amount of credits to buy
 *
 * @param signature The signature of the signed transaction
 */

export async function createSignedSignatureChainTx(
  creditsToBuy: number,
  signature: string,
) {
  const payload = await getJwtPayload();

  if (!payload) return;

  const SOLANA_COST_PER_CREDIT = process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT;

  if (!SOLANA_COST_PER_CREDIT) {
    return {
      error: "Invalid SOL cost per credit.",
    };
  }

  const treasuryKey = getTreasuryPrivateKey();

  if (!treasuryKey) {
    return {
      error: "Internal server error.",
    };
  }

  if (typeof creditsToBuy !== "number" || creditsToBuy <= 0) {
    return {
      error: "Invalid credits value. It must be a positive number.",
    };
  }

  const solAmount = Number(SOLANA_COST_PER_CREDIT) * Number(creditsToBuy);

  const wallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
    select: {
      address: true,
    },
  });

  if (!wallet) {
    return {
      error: "Wallet not found",
    };
  }

  const fromWallet = Keypair.fromSecretKey(base58.decode(treasuryKey));

  const treasuryAddress = fromWallet.publicKey.toString();

  try {
    await prisma.chainTx.create({
      data: {
        hash: signature,
        status: EChainTxStatus.New,
        solAmount: String(solAmount),
        wallet: wallet?.address,
        feeSolAmount: "0",
        recipientAddress: treasuryAddress,
        type: EChainTxType.CreditPurchase,
      },
    });
  } catch {
    return {
      error:
        "Unable to create chain transaction. Don't worry, nothing was submitted on-chain. Please try again",
    };
  }

  await updateTransactionLog(signature, creditsToBuy, payload.sub);
}
