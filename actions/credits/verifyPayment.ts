"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { CONNECTION } from "@/app/utils/solana";
import { getTreasuryPrivateKey } from "@/lib/env-vars";
import {
  EChainTxStatus,
} from "@prisma/client";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import base58 from "bs58";
import Decimal from "decimal.js";
import pRetry from "p-retry";

import { getWalletOwner } from "../../lib/wallet";

export async function verifyPayment(txHash: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const record = await prisma.chainTx.findFirst({
    where: {
      hash: txHash,
      status: EChainTxStatus.New,
    },
  });

  if (!record) {
    return false;
  }

  const solAmount = record.solAmount;

  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(getTreasuryPrivateKey() ?? ""),
  );

  let transferVerified = false;

  try {
    const txInfo = await pRetry(
      async () => {
        const txInfo = await CONNECTION.getParsedTransaction(txHash, {
          commitment: "finalized",
        });

        if (!txInfo?.transaction) throw new Error("Transaction not found");

        return txInfo;
      },
      {
        retries: 4,
      },
    );

    if (!txInfo) {
      return false;
    }

    const instructions = txInfo.transaction.message.instructions;

    const senderPubKey = txInfo.transaction.message.accountKeys[0].pubkey;

    const wallet = senderPubKey.toBase58();

    const walletOwner = await getWalletOwner(wallet);

    if (walletOwner != payload.sub || record.wallet != wallet) {
      return false;
    }

    const expectedLamports = new Decimal(solAmount)
      .mul(LAMPORTS_PER_SOL)
      .toNumber();

    for (const instruction of instructions) {
      if ("parsed" in instruction) {
        const parsed = instruction.parsed;

        // Protects against scenario where money flows to the treasury in
        // one instruction but then back out in another (could potentially
        // still be valid if the net amount is correct, but there are
        // many edge cases to consider if we allow this...)
        if (
          parsed.type === "transfer" &&
          parsed.info.source === treasuryWallet &&
          parsed.info.lamports > 0
        ) {
          return false;
        }

        if (
          parsed.type === "transfer" &&
          parsed.info.source === wallet &&
          parsed.info.destination === treasuryWallet &&
          parsed.info.lamports === expectedLamports
        ) {
          transferVerified = true;
        }
      }
    }
  } catch {
    return false;
  }

  return transferVerified;
}
