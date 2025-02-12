import { TRANSACTION_COMMITMENT } from "@/app/constants/solana";
import { CONNECTION } from "@/app/utils/solana";
import { VerificationResult } from "@/types/credits";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";
import pRetry from "p-retry";
import "server-only";

const MAX_RETRIES = 4;

export async function verifyTransactionInstructions(
  txHash: string,
  solAmount: string,
): Promise<VerificationResult> {
  const treasuryAddress = process.env.NEXT_PUBLIC_TREASURY_ADDRESS;
  if (!treasuryAddress) {
    return { success: false, error: "Treasury address not defined" };
  }

  const treasuryWallet = new PublicKey(treasuryAddress);

  try {
    const txInfo = await pRetry(
      async () => {
        const txInfo = await CONNECTION.getParsedTransaction(txHash, {
          commitment: TRANSACTION_COMMITMENT,
        });

        if (!txInfo?.transaction) throw new Error("Transaction not found");
        return txInfo;
      },
      { retries: MAX_RETRIES },
    );

    if (!txInfo) {
      return { success: false, error: "Transaction info not found" };
    }

    const instructions = txInfo.transaction.message.instructions;
    const senderPubKey = txInfo.transaction.message.accountKeys[0].pubkey;
    const wallet = senderPubKey.toBase58();
    const expectedLamports = new Decimal(solAmount)
      .mul(LAMPORTS_PER_SOL)
      .toNumber();

    let transferVerified = false;

    for (const instruction of instructions) {
      if ("parsed" in instruction) {
        const parsed = instruction.parsed;

        if (
          parsed.type === "transfer" &&
          parsed.info.source === treasuryWallet &&
          parsed.info.lamports > 0
        ) {
          return { success: false, error: "Invalid treasury outflow detected" };
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

    return {
      success: transferVerified,
      wallet: wallet,
      error: transferVerified
        ? undefined
        : "Transfer instruction verification failed",
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during verification",
    };
  }
}
