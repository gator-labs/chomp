"use client";

import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
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
      <DynamicConnectButton buttonClassName="bg-primary text-btn-text-primary rounded-lg inline-flex justify-center py-4 px-16 rounded-2xl font-bold text-base">
        Connect Wallet
      </DynamicConnectButton>
      <p className="text-[13px]">Connect your wallet to begin</p>
    </main>
  );
}
