"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useTokenBalance } from "./hooks/useTokenBalance";
import c from "./page.module.css";
import { getJwtPayload } from "@/lib/auth";

export default function Page() {
  const { balance } = useTokenBalance();
  const { handleLogOut } = useDynamicContext();

  // const jwt = await getJwtPayload();

  return (
    <main className={c.main}>
      home page
      {/* <pre>{JSON.stringify(jwt, null, 2)}</pre> */}
      <div>bonk balance: {balance}</div>
      <button onClick={() => handleLogOut()}>Log out</button>
    </main>
  );
}
