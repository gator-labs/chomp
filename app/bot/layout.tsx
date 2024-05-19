"use client";

import { TurnkeyProvider } from "@turnkey/sdk-react";

export default function BotLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const turnkeyConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    serverSignUrl: process.env.NEXT_PUBLIC_TURNKEY_SIGNER_URL!,
  };
  return <TurnkeyProvider config={turnkeyConfig}>{children}</TurnkeyProvider>;
}
