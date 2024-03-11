"use client";

import { useTokenBalance } from "./hooks/useTokenBalance";
import c from "./page.module.css";

export default function Page() {
  const { balance } = useTokenBalance();

  return (
    <main className={c.main}>
      home page
      <div>bonk balance: {balance}</div>
    </main>
  );
}
