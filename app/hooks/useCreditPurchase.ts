import { initiateCreditPurchase } from "@/lib/credits/initiatePurchase";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useState } from "react";

import { errorToastLayout } from "../providers/ToastProvider";

interface UseCreditPurchaseProps {
  primaryWallet: Wallet | null;
}

export function useCreditPurchase({ primaryWallet }: UseCreditPurchaseProps) {
  const [isProcessingTx, setIsProcessingTx] = useState(false);

  const processCreditPurchase = async (creditsToBuy: number) => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      errorToastLayout("Please connect your Solana wallet first");
      return;
    }

    try {
      await initiateCreditPurchase(
        creditsToBuy,
        primaryWallet,
        setIsProcessingTx,
      );
    } catch (error: any) {
      console.error("Credit purchase process failed:", error);
      throw new Error(error.message || "Credit purchase failed");
    }
  };

  return {
    isProcessingTx,
    processCreditPurchase,
  };
}
