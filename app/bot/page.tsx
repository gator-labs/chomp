"use client";

import { FC, useMemo } from "react";
import { WalletProvider } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";

import TiplinkConnect from "./tiplinkConnect";

const ConnectWithOtpView: FC = () => {

  const clientId = process.env.NEXT_PUBLIC_TIPLINK_CLIENT_ID || ''

  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Chomp",
        clientId: clientId,
        theme: "dark"
      }),
    ],
    []
  );

  return (
    <WalletProvider wallets={wallets} autoConnect >
      <div className="space-y-6 flex flex-col w-2/3 mt-12">
        <p className="text-2xl text-center">Good job chompins!</p>
        <TiplinkConnect />
      </div>
    </WalletProvider>
  );
};

export default ConnectWithOtpView;
