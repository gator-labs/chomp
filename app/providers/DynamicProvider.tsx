"use client";

import trackEvent from "@/lib/trackEvent";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import * as Sentry from "@sentry/nextjs";
import { clearJwt } from "../actions/jwt";
import { TRACKING_EVENTS, TRACKING_METADATA } from "../constants/tracking";
import { LoginError } from "../utils/error";
import { usePathname } from "next/navigation";
import { GlobalWalletExtension } from "@dynamic-labs/global-wallet";

export default function DynamicProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("Loading DynamicProvider " + process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ); 
  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
        walletConnectorExtensions: [GlobalWalletExtension]
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
