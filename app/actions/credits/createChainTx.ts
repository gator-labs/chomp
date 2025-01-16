"use server";

import prisma from "@/app/services/prisma";
import { sleep } from "@/app/utils/sleep";
import { getTreasuryPrivateKey } from "@/lib/env-vars";
import { EChainTxStatus, EChainTxType } from "@prisma/client";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";
import { v4 as uuidv4 } from "uuid";

import { getJwtPayload } from "../jwt";

export type BuyCreditsResult =
  | {
      error: string;
    }
  | {
      txHash: string;
    };

/**
 * Create a new chainTx - Save the entry in chain tx table when
 * user initiate credit purchase, create sol tx and call update fatl action.
 *
 * @param deckId The backend should validate the amount of credit
 *               purchased based on deck id
 */

export async function createBuyCreditsTx(
  creditToBuy: number,
): Promise<BuyCreditsResult> {
  const payload = await getJwtPayload();

  const treasuryKey = getTreasuryPrivateKey();

  if (
    !payload ||
    !process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT ||
    !treasuryKey
  ) {
    return {
      error: "Internal Server Error",
    };
  }

  if (typeof creditToBuy !== "number" || creditToBuy <= 0) {
    return {
      error: "Invalid creditToBuy value. It must be a positive number.",
    };
  }

  const solAmount =
    Number(process.env.NEXT_PUBLIC_SOLANA_COST_PER_CREDIT) *
    Number(creditToBuy);

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
      error: "Wallet not found.",
    };
  }

  const fromWallet = Keypair.fromSecretKey(base58.decode(treasuryKey));

  const treasuryAddress = fromWallet.publicKey.toString();

  let newChainTx;

  try {
    newChainTx = await prisma.chainTx.create({
      data: {
        hash: uuidv4(),
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
        "Unable to prepare transaction. Don't worry, nothing was submitted on-chain. Please try again",
    };
  }

  // stimulate submitting tx
  await sleep(5000);

  return {
    txHash: newChainTx.hash,
  };
}
