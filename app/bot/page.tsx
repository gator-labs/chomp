"use client";

import { FC, FormEventHandler, useState, useMemo, useEffect } from "react";
// import { useRouter } from "next/router";
// import {
//   useConnectWithOtp,
//   useDynamicContext,
//   useUserWallets,
// } from "@dynamic-labs/sdk-react-core";
import { Connection } from "@solana/web3.js";

import { registerTipLinkWallet } from "@tiplink/wallet-adapter";
import { TipLinkWalletAutoConnectV2 } from "@tiplink/wallet-adapter-react-ui";
import { GoogleViaTipLinkWalletName } from '@tiplink/wallet-adapter'
import { WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { TipLinkWalletAdapter } from "@tiplink/wallet-adapter";
import { CONNECTION, genBonkBurnTx } from '../utils/solana';

import TiplinkConnect from "./tiplinkConnect";


const ConnectWithOtpView: FC = () => {
  // const urlParams = new URLSearchParams(window.location.search);
  // const initData = urlParams.get('initData');
  // console.log(initData)
  const tele = window?.Telegram?.WebApp
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

  useEffect(() => {
    console.log(tele)
  }, [])

  return (
    <WalletProvider wallets={wallets} autoConnect >
      <div className="space-y-6 flex flex-col w-2/3 mt-12">
        <p className="text-2xl text-center">Good job chompin!</p>
        {JSON.stringify(tele)}


        <TiplinkConnect />


      </div>
    </WalletProvider>
  );
};

export default ConnectWithOtpView;
