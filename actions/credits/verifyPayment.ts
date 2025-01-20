"use server";

import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
import { getJwtPayload } from "@/app/actions/jwt";
import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { CONNECTION } from "@/app/utils/solana";
import { VerifyPaymentError } from "@/lib/error";
import { EChainTxStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import pRetry from "p-retry";

import { getWalletOwner } from "../../lib/wallet";

const MAX_RETRIES = 4;

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

  const treasuryAddress = await getTreasuryAddress();

  if (!treasuryAddress) throw new Error("Treasury address not defined");

  const treasuryWallet = new PublicKey(treasuryAddress);

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
        retries: MAX_RETRIES,
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
          parsed.info.destination === treasuryAddress &&
          parsed.info.lamports === expectedLamports
        ) {
          transferVerified = true;
        }
      }
    }
  } catch (error) {
    const verifyPaymentError = new VerifyPaymentError(
      `Unable to verify SOL payment for user ${payload.sub}, tx ${record?.hash}`,
      { cause: error },
    );
    Sentry.captureException(verifyPaymentError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return false;
  }

  if (!transferVerified) {
    Sentry.captureMessage(
      `Verification of SOL payment for user ${payload.sub} failed. Transaction: https://solscan.io/tx/${record?.hash}`,
      {
        level: "error",
        tags: {
          category: "sol-payment-not-verified",
        },
        extra: {
          record,
        },
      },
    );
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  return transferVerified;
}
