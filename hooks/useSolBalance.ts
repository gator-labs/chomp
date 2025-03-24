import { getSolBalance } from "@/app/utils/solana";
import { SOLANA_TRANSACTION_BUFFER } from "@/constants/solana";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";

export function useSolBalance(primaryWallet: { address: string } | null) {
  const [solBalance, setSolBalance] = useState<number | undefined>(undefined);

  useEffect(() => {
    const fetchSolBalance = async () => {
      if (primaryWallet?.address) {
        const balance = await getSolBalance(primaryWallet.address);
        setSolBalance(balance);
      }
    };

    fetchSolBalance();
  }, [primaryWallet?.address]);

  const isSolBalanceKnown = solBalance !== undefined;

  const hasBalanceWithBuffer = (
    cost: Decimal,
    buffer = SOLANA_TRANSACTION_BUFFER,
  ) => {
    if (!isSolBalanceKnown) return false;

    return cost.add(buffer).lessThanOrEqualTo(solBalance ?? 0);
  };

  return {
    solBalance,
    isSolBalanceKnown,
    hasBalanceWithBuffer,
  };
}
