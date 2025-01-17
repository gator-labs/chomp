import { createSignedSignatureChainTx } from "@/actions/credits/createChainTx";
import { getJwtPayload } from "@/app/actions/jwt";
import { acquireMutex } from "@/app/utils/mutex";
import { createCreditPurchaseTransaction } from "@/lib/credits/createTransaction";
import { processTransaction } from "@/lib/credits/processTransaction";
import { Wallet } from "@dynamic-labs/sdk-react-core";

/**
 * Initiates and processes a credit purchase transaction
 *
 * @param creditsToBuy - Number of credits the user wants to purchase
 * @param wallet - User's wallet instance from Dynamic SDK
 * @param setIsProcessingTx - Callback to update transaction processing state in UI
 *
 * @throws Error if user is not authenticated or processing fails
 *
 */
export async function initiateCreditPurchase(
  creditsToBuy: number,
  wallet: Wallet,
  setIsProcessingTx: (isProcessingTx: boolean) => void,
) {
  const payload = await getJwtPayload();
  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  const release = await acquireMutex({
    identifier: "CREDIT_PURCHASE",
    data: { userId: payload.sub },
  });

  try {
    // Step 1: Create and sign the transaction
    const data = await createCreditPurchaseTransaction(
      creditsToBuy,
      wallet,
      setIsProcessingTx,
    );

    if (!data) {
      return {
        error: "Transaction declined",
      };
    }

    const { transaction, signature } = data;

    // Step 2: Record the signed transaction in ChainTx
    const chainTx = await createSignedSignatureChainTx(
      creditsToBuy,
      signature!,
    );

    if (chainTx?.error) {
      return {
        error: chainTx.error,
      };
    }

    // Step 3: Submit transaction on-chain and handle confirmation
    const result = await processTransaction(
      transaction!,
      creditsToBuy,
      setIsProcessingTx,
    );

    if (result?.error) {
      return {
        error: result.error,
      };
    }
  } catch (error) {
    console.log("Error initiating purchase", error);
    throw error;
  } finally {
    setIsProcessingTx(false);
    release();
  }
}
