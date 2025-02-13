import { createCreditPurchaseTransaction } from "@/lib/credits/createTransaction";
import { initiateCreditPurchase } from "@/lib/credits/initiatePurchase";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useState } from "react";

interface UseCreditPurchaseProps {
  primaryWallet: Wallet | null;
}

export function useCreditPurchase({ primaryWallet }: UseCreditPurchaseProps) {
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  const processCreditPurchase = async (creditsToBuy: number) => {
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
