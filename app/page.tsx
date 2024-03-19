"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useTokenBalance } from "./hooks/useTokenBalance";
import c from "./page.module.css";

export default function Page() {
  const { balance } = useTokenBalance();
  const { handleLogOut } = useDynamicContext();

  return (
    <main className={c.main}>
      home page
      <div>bonk balance: {balance}</div>
      <button onClick={() => handleLogOut()}>Log out</button>
    </main>
  );
}
