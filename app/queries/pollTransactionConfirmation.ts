import { TransactionSignature } from "@solana/web3.js";

import { CONNECTION } from "../utils/solana";

/**
 * Poll a transaction to check whether it has been confirmed
 * @param {TransactionSignature} txtSig - The transaction signature
 * @returns {Promise<TransactionSignature>} - The confirmed transaction signature or an error if the confirmation times out
 */
export const pollTransactionConfirmation = async (
  txtSig: TransactionSignature,
): Promise<TransactionSignature> => {
  // 15 second timeout
  const timeout = 15000;
  // 5 second retry interval
  const interval = 5000;
  let elapsed = 0;

  return new Promise<TransactionSignature>((resolve, reject) => {
    const intervalId = setInterval(async () => {
      elapsed += interval;

      if (elapsed >= timeout) {
        clearInterval(intervalId);
        reject(new Error(`Transaction ${txtSig}'s confirmation timed out`));
      }

      const status = await CONNECTION.getSignatureStatus(txtSig);

      if (status?.value?.confirmationStatus === "confirmed") {
        clearInterval(intervalId);
        resolve(txtSig);
      }
    }, interval);
  });
};
