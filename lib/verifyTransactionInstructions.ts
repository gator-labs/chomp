import { getTreasuryAddress } from "@/actions/getTreasuryAddress";
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
  const startTime = Date.now();
  let lastLogTime = startTime;

  const logStep = (stepName: string) => {
    const now = Date.now();
    const stepDuration = ((now - lastLogTime) / 1000).toFixed(2);
    const totalDuration = ((now - startTime) / 1000).toFixed(2);
    console.log(
      `VerifyInstructions - ${stepName}\n` +
      `Step duration: ${stepDuration}s\n` +
      `Total duration: ${totalDuration}s\n` +
      '------------------------'
    );
    lastLogTime = now;
  };

  logStep('Starting verifyTransactionInstructions');

  const treasuryAddress = await getTreasuryAddress();
  if (!treasuryAddress) {
    return { success: false, error: "Treasury address not defined" };
  }
  logStep('Treasury address retrieved');

  const treasuryWallet = new PublicKey(treasuryAddress);

  try {
    const txInfo = await pRetry(
      async () => {
        logStep('Starting transaction info retrieval attempt');
        const txInfo = await CONNECTION.getParsedTransaction(txHash, {
          commitment: "confirmed",
        });

        if (!txInfo?.transaction) throw new Error("Transaction not found");
        logStep('Transaction info retrieved');
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
    logStep('Transaction details parsed');

    let transferVerified = false;

    for (const instruction of instructions) {
      if ("parsed" in instruction) {
        const parsed = instruction.parsed;

        if (
          parsed.type === "transfer" &&
          parsed.info.source === treasuryWallet &&
          parsed.info.lamports > 0
        ) {
          logStep('Invalid treasury outflow detected');
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
    logStep('Instructions verification completed');

    return {
      success: transferVerified,
      wallet: wallet,
      error: transferVerified
        ? undefined
        : "Transfer instruction verification failed",
    };
  } catch (error) {
    logStep('Error encountered');
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Unknown error during verification",
    };
  }
}
