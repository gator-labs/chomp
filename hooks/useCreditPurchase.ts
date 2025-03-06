import { initiateCreditPurchase } from "@/actions/credits/initiatePurchase";
import { createCreditPurchaseTransaction } from "@/lib/credits/createTransaction";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { CreditPack } from "@prisma/client";
import { useState } from "react";

export function useCreditPurchase() {
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const { primaryWallet } = useDynamicContext();

  const processCreditPurchase = async (
    creditsToBuy: number,
    creditPack: CreditPack | null = null,
  ) => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return {
        error: "Please connect your Solana wallet",
      };
    }

    try {
      // Step 1: Create and sign the transaction
      const data = await createCreditPurchaseTransaction(
        creditsToBuy,
        primaryWallet,
        creditPack,
      );

      if (
        !data ||
        data.signature === undefined ||
        data.transaction === undefined
      ) {
        return {
          error: "Transaction declined",
        };
      }

      setIsProcessingTx(true);

      // Step 2: Submit transaction on-chain and handle confirmation
      const result = await initiateCreditPurchase(
        creditsToBuy,
        data?.signature,
        data?.transaction,
        creditPack?.id,
      );

      if (result?.error) {
        return {
          error: result.error,
        };
      }
    } catch {
      throw new Error("Credit purchase failed");
    } finally {
      setIsProcessingTx(false);
    }
  };

  return {
    isProcessingTx,
    processCreditPurchase,
  };
}
