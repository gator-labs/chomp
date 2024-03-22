"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Button } from "../components/Button/Button";

export default function Page() {
  const { user } = useDynamicContext();

  useEffect(() => {
    if (user) {
      redirect("/application");
    }
  }, [user]);

  return (
    <main className="flex flex-col justify-center items-center gap-3 h-full">
      <Button variant="primary" size="big" dynamic>
        Connect Wallet
      </Button>
      <p className="text-[13px]">Connect your wallet to begin</p>
    </main>
  );
}
