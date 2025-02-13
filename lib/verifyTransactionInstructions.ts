import { TRANSACTION_COMMITMENT } from "@/app/constants/solana";
import { getSolPaymentAddress } from "@/app/utils/getSolPaymentAddress";
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
  const solPaymentAddress = getSolPaymentAddress();
  if (!solPaymentAddress) {
    return { success: false, error: "SOL Payment Address is not defined" };
  }

  const solPaymentWallet = new PublicKey(solPaymentAddress);

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
          parsed.info.source === solPaymentWallet &&
          parsed.info.lamports > 0
        ) {
          return {
            success: false,
            error: "Invalid SOL Payment Address outflow detected",
          };
        }

        if (
          parsed.type === "transfer" &&
          parsed.info.source === wallet &&
          parsed.info.destination === solPaymentWallet &&
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
