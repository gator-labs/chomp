"use client";

import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useEffect } from "react";
import { setJwt } from "../actions/jwt";

export default function Page() {
  const { authToken } = useDynamicContext();

  useEffect(() => {
    if (authToken) {
      setJwt(authToken);
    }
  }, [authToken]);

  return (
    <main className="flex flex-col justify-center items-center gap-3 h-full">
      <DynamicConnectButton buttonClassName="bg-primary text-btn-text-primary rounded-lg inline-flex justify-center py-4 px-16 rounded-2xl font-bold text-base">
        Connect Wallet
      </DynamicConnectButton>
      <p className="text-[13px]">Connect your wallet to begin</p>
    </main>
  );
}
