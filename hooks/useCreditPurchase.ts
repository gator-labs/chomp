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
    console.log(primaryWallet);
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return {
        error: "Please connect your Solana wallet",
      };
    }

    try {
      const result = await initiateCreditPurchase(
        creditsToBuy,
        primaryWallet,
        setIsProcessingTx,
      );

      if (result?.error) {
        return {
          error: result.error,
        };
      }
    } catch {
      throw new Error("Credit purchase failed");
    }
  };

  return {
    isProcessingTx,
    processCreditPurchase,
  };
}
