import pRetry from "p-retry";
import "server-only";

import { sleep } from "./sleep";
import { CONNECTION } from "./solana";

export const checkTransactionStatus = async (signature: string) => {
  return await pRetry(
    async () => {
      // First try with getParsedTransaction
      const transaction = await CONNECTION.getParsedTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      // If transaction exists, check for errors
      if (transaction) {
        if (transaction.meta?.err) {
          throw new Error(
            `Get Parsed Transaction failed: ${JSON.stringify(transaction.meta.err)}`,
          );
        }
        // Transaction confirmed and successful
        return true;
      }

      // Fallback to getSignatureStatus if transaction not found
      const status = await CONNECTION.getSignatureStatus(signature);

      // Check for errors in status
      if (status?.value?.err) {
        throw new Error(
          `Get Signature Status failed: ${JSON.stringify(status.value.err)}`,
        );
      }

      // Check confirmation status
      if (
        status?.value?.confirmationStatus === "confirmed" ||
        status?.value?.confirmationStatus === "finalized"
      ) {
        return true;
      }

      // If we get here, the transaction hasn't been confirmed yet
      throw new Error(
        `Transaction not yet confirmed. Current status: ${status?.value?.confirmationStatus || "null"}`,
      );
    },
    {
      retries: 2,
      onFailedAttempt: async () => {
        // Wait for 2 seconds to ensure status is updated
        await sleep(2000);
      },
    },
  );
};
