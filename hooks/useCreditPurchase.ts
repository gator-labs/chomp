import { initiateCreditPurchase } from "@/actions/credits/initiatePurchase";
import { createCreditPurchaseTransaction } from "@/lib/credits/createTransaction";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useState } from "react";

export function useCreditPurchase() {
  const [isProcessingTx, setIsProcessingTx] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const { primaryWallet } = useDynamicContext();

  const processCreditPurchase = async (creditsToBuy: number) => {
    setTxHash(null);

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

      setTxHash(data?.signature ?? null);
      setIsProcessingTx(true);

      // Step 2: Submit transaction on-chain and handle confirmation
      const result = await initiateCreditPurchase(
        creditsToBuy,
        data?.signature,
        data?.transaction,
      );

      if (result?.error) {
        return {
          txHash: data?.signature,
          error: result.error,
        };
      }
    } catch {
      throw new Error("Credit purchase failed");
    } finally {
      setIsProcessingTx(false);
    }
  };

  const abortCreditPurchase = () => {
    setIsProcessingTx(false);
  };

  return {
    isProcessingTx,
    txHash,
    processCreditPurchase,
    abortCreditPurchase,
  };
}
