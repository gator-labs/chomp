"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { usePathname } from "next/navigation";
import { clearJwt } from "../actions/jwt";

export default function DynamicProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
        eventsCallbacks: {
          onLogout: () => {
            if (pathname !== "/bot") {
              clearJwt();
            }
          },
        },
        mobileExperience: "redirect",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
