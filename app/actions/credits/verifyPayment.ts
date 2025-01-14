"use server";

import prisma from "@/app/services/prisma";

import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import base58 from "bs58";
import Decimal from "decimal.js";

import { getWalletOwner } from "../../../lib/wallet";
import { acquireMutex } from "../../utils/mutex";
import { CONNECTION } from "../../utils/solana";
import { getJwtPayload } from "../jwt";

export async function verifyPayment(txHash: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "VERIFY_SOL_PAYMENT",
    data: { userId: payload.sub },
  });

  const record = await prisma.chainTx.findFirst({
    where: {
      hash: txHash,
      wallet: payload.sub
    }
  });

  if (!record) {
    release();
    return false;
  }

  const solAmount = record.solAmount;

  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  let transferVerified = false;

  try {
    const txInfo = await CONNECTION.getParsedTransaction(txHash, {
      commitment: "finalized",
    });

    if (!txInfo) {
      release();
      return false;
    }

    const instructions = txInfo.transaction.message.instructions;

    const senderPubKey = txInfo.transaction.message.accountKeys[0].pubkey;

    const wallet = senderPubKey.toBase58();

    const walletOwner = await getWalletOwner(wallet);

    if (walletOwner != payload.sub) {
      release();
      return false;
    }

    const expectedLamports = new Decimal(solAmount)
      .mul(LAMPORTS_PER_SOL)
      .toNumber();

    for (const instruction of instructions) {
      if ("parsed" in instruction) {
        const parsed = instruction.parsed;

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
  } catch (error) {
    release();
    return false;
  }

  release();

  return transferVerified;
}
