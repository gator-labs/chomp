
"use client";

import { DynamicWidget, useDynamicContext, useTelegramLogin } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import Spinner from "./Spinner";
import { ISolana, isSolanaWallet } from '@dynamic-labs/solana-core';
import { genBonkBurnTx } from "../utils/solana";
import { Connection } from '@solana/web3.js';
import { setJwt } from "../actions/jwt";


const BONK_AMOUNT = 5

export default function Main() {
  const { sdkHasLoaded, user, primaryWallet, authToken } = useDynamicContext();
  const { telegramSignIn, isAuthWithTelegram } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!sdkHasLoaded) return;

    if (authToken) setJwt(authToken);

    const signIn = async () => {
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded]);


  const burnBonk = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return;
    }

    const connection: Connection = await primaryWallet.getConnection();
    const blockhash = await connection.getLatestBlockhash();

    const signer = await primaryWallet.getSigner()

    const tx = await genBonkBurnTx(
      primaryWallet.address,
      blockhash.blockhash,
      BONK_AMOUNT,
    );

    signer.signAndSendTransaction(tx)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-black" style={{ backgroundColor: "#f9f9fb", backgroundImage: "url('/background-pattern.svg')", backgroundBlendMode: "overlay", backgroundRepeat: "repeat" }}>
      <div className="flex flex-col items-center justify-center text-center max-w-3xl px-4">
        <div className="pt-8">
          <div className="inline-flex items-center justify-center">
            <img src="/logo-full.svg" alt="logo" className="w-auto h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm mb-7 mt-7 text-sm">
          <h2 className="text-xl font-semibold mb-3">Start chomping</h2>
          <div className="flex justify-center py-4">
            {isLoading ? <Spinner /> : <DynamicWidget />}
          </div>
          {user && (<><p className="mb-3">
            Zero clicks, your wallet already exists.
          </p>
            <button className='bg-purple-500 p-2 rounded-md text-lg' onClick={burnBonk}>Burn {BONK_AMOUNT} $BONK</button></>)}
        </div>
      </div>
    </div>
  );
}
