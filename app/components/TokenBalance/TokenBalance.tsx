"use client";

import { useTokenBalance } from "@/app/hooks/useTokenBalance";

export function TokenBalance() {
  const { balance } = useTokenBalance();

  return <div>bonk balance: {balance}</div>;
}
