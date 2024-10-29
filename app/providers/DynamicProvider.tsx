"use client";

import trackEvent from "@/lib/trackEvent";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import * as Sentry from "@sentry/nextjs";

import { clearJwt } from "../actions/jwt";
import { TRACKING_EVENTS, TRACKING_METADATA } from "../constants/tracking";
import { LoginError } from "../utils/error";

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
          onAuthFlowOpen() {
            trackEvent(TRACKING_EVENTS.LOGIN_STARTED);
          },
          onAuthInit: (data) => {
            if (data?.type === "email") {
              trackEvent(TRACKING_EVENTS.Login_Email_Submitted, {
                [TRACKING_METADATA.USER_EMAIL]: data?.email,
              });
            } else if (data?.type === "wallet") {
              trackEvent(TRACKING_EVENTS.Login_Wallet_Selected, {
                [TRACKING_METADATA.CONNECTOR_NAME]: data?.connectorName,
                [TRACKING_METADATA.USER_WALLET_ADDRESS]: data?.address,
              });
            }
          },
          onAuthFailure: (method, reason: any) => {
            let reasonMessage;
            if (typeof reason === "object" && reason.error.message) {
              reasonMessage = reason?.error?.message;
            } else {
              reasonMessage = reason;
            }
            if (method?.type === "email") {
              trackEvent(TRACKING_EVENTS.LOGIN_FAILED, {
                [TRACKING_METADATA.USER_EMAIL]: method?.email,
                [TRACKING_METADATA.LOGIN_FAILED_REASON]: reasonMessage,
              });
            } else if (method?.type === "wallet") {
              trackEvent(TRACKING_EVENTS.LOGIN_FAILED, {
                [TRACKING_METADATA.CONNECTOR_NAME]: method?.connectorName,
                [TRACKING_METADATA.USER_WALLET_ADDRESS]: method?.address,
                [TRACKING_METADATA.LOGIN_FAILED_REASON]: reasonMessage,
              });
            }
            const loginError = new LoginError(
              `User is having trouble logging in: ${method}`,
              { cause: reason },
            );
            Sentry.captureException(loginError);
          },
          onAuthSuccess: ({ isAuthenticated, user }) => {
            if (isAuthenticated) {
              trackEvent(TRACKING_EVENTS.LOGIN_SUCCEED, {
                [TRACKING_METADATA.USER_EMAIL]:
                  user?.verifiedCredentials[0].email,
                [TRACKING_METADATA.USER_WALLET_ADDRESS]:
                  user?.verifiedCredentials[0].address,
                [TRACKING_METADATA.USER_ID]: user?.userId,
              });
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
