"use client";

import Spinner from "@/app/bot/Spinner";
import { DynamicWidget, useDynamicContext, useTelegramLogin } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { ISolana, isSolanaWallet } from '@dynamic-labs/solana-core';
import { Connection } from '@solana/web3.js';
import trackEvent from "@/lib/trackEvent";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { genBonkBurnTx } from "@/app/utils/solana";
import { TelegramAuthDataProps } from "@/app/bot/page";

const BONK_AMOUNT = 5;

export default function Bot({ telegramAuthData}: { telegramAuthData: TelegramAuthDataProps } ) {
  const { sdkHasLoaded, user, primaryWallet } = useDynamicContext();
  const { telegramSignIn } = useTelegramLogin();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("sdkHasLoaded", sdkHasLoaded);
    if (!sdkHasLoaded) return;

  if (telegramAuthData) {
    trackEvent(TRACKING_EVENTS.TELEGRAM_USER_MINIAPP_OPENED, {
      [TRACKING_METADATA.TELEGRAM_FIRST_NAME]: telegramAuthData.firstName,
      [TRACKING_METADATA.TELEGRAM_LAST_NAME]: telegramAuthData.lastName,
      [TRACKING_METADATA.TELEGRAM_USERNAME]: telegramAuthData.username,
      [TRACKING_METADATA.TELEGRAM_ID]: telegramAuthData.id,
    });
  }

    const signIn = async () => {
      console.log("user", user);
      if (!user) {
        await telegramSignIn({ forceCreateUser: true });
      }
      setIsLoading(false);
    };

    signIn();
  }, [sdkHasLoaded]);

  const burnBonk = async () => {
    if(!primaryWallet || !isSolanaWallet(primaryWallet)) {
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
    <div className="min-h-screen flex flex-col items-center justify-center text-black" style={{backgroundColor: "#f9f9fb", backgroundImage: "url('/background-pattern.svg')", backgroundBlendMode: "overlay", backgroundRepeat: "repeat"}}>
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
  )
}