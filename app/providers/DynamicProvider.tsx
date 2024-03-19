"use client";

import { clearJwt, setJwt } from "@/lib/auth";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export default function DynamicProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
        eventsCallbacks: {
          onAuthSuccess: ({ authToken }) => {
            setJwt(authToken);
          },
          onLogout: () => {
            clearJwt();
          },
        },
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
