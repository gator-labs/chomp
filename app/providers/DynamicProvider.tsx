"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import * as Sentry from "@sentry/nextjs";
import { clearJwt } from "../actions/jwt";

export default function DynamicProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DynamicContextProvider
      theme="dark"
      settings={{
        environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID || "",
        walletConnectors: [SolanaWalletConnectors],
        eventsCallbacks: {
          onLogout: () => {
            clearJwt();
          },
          onAuthFailure: (method, reason) => {
            class LoginError extends Error {}
            const loginError = new LoginError(
              `User is having trouble logging in: ${method}`,
              { cause: reason },
            );
            Sentry.captureException(loginError);
          },
        },
        mobileExperience: "redirect",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
