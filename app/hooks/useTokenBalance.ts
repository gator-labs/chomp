"use client";

import { useUserWallets } from "@dynamic-labs/sdk-react-core";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { connection, findSplTokenPda } from "../helpers/web3";

export const useTokenBalance = () => {
  const wallets = useUserWallets();

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!connection || !wallets) {
      setBalance(0);
      return;
    }

    async function fetchTokenBalance() {
      const balances = await Promise.all(
        wallets
          .filter((wallet) => wallet.chain === "solana")
          .map(async (wallet) => {
            try {
              const tokenAccount = findSplTokenPda(
                new PublicKey(wallet.address),
                new PublicKey(process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "")
              );

              const tokenAccountBalance =
                await connection.getTokenAccountBalance(tokenAccount);

              return tokenAccountBalance.value.uiAmount ?? 0;
            } catch {
              return 0;
            }
          })
      );

      setBalance(Math.floor(balances.reduce((acc, cur) => acc + cur, 0)));
    }

    fetchTokenBalance();
  }, [wallets]);

  return { balance };
};
