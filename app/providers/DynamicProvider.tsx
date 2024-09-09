"use client";

import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { clearJwt } from "../actions/jwt";
import sendToMixpanel from "@/lib/mixpanel";
import { MIX_PANEL_EVENTS, MIX_PANEL_METADATA } from "../constants/mixpanel";
  
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
            sendToMixpanel(MIX_PANEL_EVENTS.LOGIN_STARTED);
          },
          onAuthInit: (data) => {
            if (data?.type === "email") {
              sendToMixpanel(MIX_PANEL_EVENTS.Login_Email_Submitted, {
                [MIX_PANEL_METADATA.USER_EMAIL]: data?.email,
              });
            } else if (data?.type === 'wallet') {
              sendToMixpanel(MIX_PANEL_EVENTS.Login_Wallet_Selected, {
                [MIX_PANEL_METADATA.CONNECTOR_NAME]: data?.connectorName,
                [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: data?.address,
              });
            }
          },
          onAuthFailure: (method, reason:any) => {
            let reasonMessage;
            if (typeof reason === 'object' && reason.error.message) {
                reasonMessage = reason?.error?.message
            } else {
              reasonMessage = reason;
            }
            if (method?.type === "email") {
              sendToMixpanel(MIX_PANEL_EVENTS.LOGIN_FAILED, {
                [MIX_PANEL_METADATA.USER_EMAIL]: method?.email,
                [MIX_PANEL_METADATA.LOGIN_FAILED_REASON]: reasonMessage,
              });
            } else if (method?.type === 'wallet') {
              sendToMixpanel(MIX_PANEL_EVENTS.LOGIN_FAILED, {
                [MIX_PANEL_METADATA.CONNECTOR_NAME]: method?.connectorName,
                [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: method?.address,
                [MIX_PANEL_METADATA.LOGIN_FAILED_REASON]: reasonMessage,
              });
            }
          },
          onAuthSuccess: ({ isAuthenticated, user }) => {
            if(isAuthenticated){
              sendToMixpanel(MIX_PANEL_EVENTS.LOGIN_SUCCEED, {
                [MIX_PANEL_METADATA.USER_EMAIL]: user?.verifiedCredentials[0].email,
                [MIX_PANEL_METADATA.USER_WALLET_ADDRESS]: user?.verifiedCredentials[0].address,
                [MIX_PANEL_METADATA.USER_ID]: user?.userId,
              }); 
            }
          }

        },
        mobileExperience: "redirect",
      }}
    >
      {children}
    </DynamicContextProvider>
  );
}
