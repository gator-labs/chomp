"use client";

import { FC, useMemo } from "react";
import { WalletProvider } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";

import TiplinkConnect from "./tiplinkConnect";

const ConnectWithOtpView: FC = () => {

  const wallets = useMemo(
    () => [
      new TipLinkWalletAdapter({
        title: "Chomp",
        clientId: "cf579504-6e22-4950-868a-9004cc3f489d",
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
