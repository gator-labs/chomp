import { creditPurchaseTx } from "@/lib/credits";
import { Wallet } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useRouter } from "next-nprogress-bar";
import { useCallback, useState } from "react";
import { toast } from "sonner";

interface UseCreditPurchaseProps {
  primaryWallet: Wallet | null;
}

/**
 * Hook to manage credit purchase flow
 * Handles transaction signing and sending to on-chain
 */
export function useCreditPurchase({ primaryWallet }: UseCreditPurchaseProps) {
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const router = useRouter();

  /**
   * Processes the credit purchase transaction in two steps:
   * 1. Sign the transaction using the wallet
   * 2. Submit and confirm the transaction
   */
  const processCreditPurchase = useCallback(
    async (creditsToBuy: number) => {
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        toast.error("Please connect your Solana wallet first");
        return;
      }

      setIsProcessingTx(true);

      try {
        await creditPurchaseTx(creditsToBuy, primaryWallet);
      } catch (error) {
        console.error("Credit purchase process failed:", error);
        throw new Error("Credit purchase failed");
      } finally {
        setIsProcessingTx(false);
      }
    },
    [primaryWallet, router],
  );

  return {
    isProcessingTx,
    processCreditPurchase,
  };
}
