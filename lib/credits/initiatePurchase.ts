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
  const startTime = Date.now();
  let lastLogTime = startTime;

  const logStep = (stepName: string) => {
    const now = Date.now();
    const stepDuration = ((now - lastLogTime) / 1000).toFixed(2);
    const totalDuration = ((now - startTime) / 1000).toFixed(2);
    console.log(
      `Step: ${stepName}\n` +
      `Step duration: ${stepDuration}s\n` +
      `Total duration: ${totalDuration}s\n` +
      '------------------------'
    );
    lastLogTime = now;
  };

  logStep('Starting initiateCreditPurchase');
  
  const payload = await getJwtPayload();
  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }
  logStep('JWT payload retrieved');

  const release = await acquireMutex({
    identifier: "CREDIT_PURCHASE",
    data: { userId: payload.sub },
  });
  logStep('Mutex acquired');

  try {
    // Step 1: Create and sign the transaction
    const data = await createCreditPurchaseTransaction(
      creditsToBuy,
      wallet,
      setIsProcessingTx,
    );
    logStep('Transaction created and signed');

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
    logStep('ChainTx recorded');

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
    logStep('Transaction processed on-chain');

    if (result?.error) {
      return {
        error: result.error,
      };
    }
  } catch (error) {
    logStep('Error encountered');
    throw error;
  } finally {
    setIsProcessingTx(false);
    release();
    logStep('Process completed');
  }
}
