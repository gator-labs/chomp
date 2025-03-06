"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import { acquireMutex } from "@/app/utils/mutex";
import { createSignedSignatureChainTx } from "@/lib/credits/createChainTx";
import { getCreditPack } from "@/lib/credits/getCreditPack";
import { processTransaction } from "@/lib/credits/processTransaction";

/**
 * Initiates and processes a credit purchase transaction
 *
 * @param creditsToBuy - Number of credits the user wants to purchase
 * @param signature - Transaction signature after user signs
 * @param transaction - Searlized and base64 encoded transaction after user signs
 * @param creditPackId - Credit pack to use (if any).
 *
 * @throws Error if user is not authenticated or processing fails
 *
 */
export async function initiateCreditPurchase(
  creditsToBuy: number,
  signature: string,
  transaction: string,
  creditPackId: string | null = null,
) {
  const payload = await getJwtPayload();
  if (!payload) {
    return {
      error: "User not authenticated",
    };
  }

  const creditPack = creditPackId ? await getCreditPack(creditPackId) : null;

  const release = await acquireMutex({
    identifier: "CREDIT_PURCHASE",
    data: { userId: payload.sub },
  });

  try {
    // Step 1: Record the signed transaction in ChainTx
    const chainTx = await createSignedSignatureChainTx(
      creditsToBuy,
      signature!,
      creditPack,
    );

    if (chainTx?.error) {
      return {
        error: chainTx.error,
      };
    }

    // Step 2: Submit transaction on-chain and handle confirmation
    const result = await processTransaction(
      transaction!,
      creditsToBuy,
      creditPack,
    );

    if (result?.error) {
      return {
        error: result.error,
      };
    }
  } catch (error) {
    throw error;
  } finally {
    release();
  }
}
