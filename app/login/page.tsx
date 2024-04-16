"use client";

import { DotLottiePlayer } from "@dotlottie/react-player";
import {
  DynamicConnectButton,
  useDynamicContext,
} from "@dynamic-labs/sdk-react-core";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { setJwt } from "../actions/jwt";
import { ProgressBar } from "../components/ProgressBar/ProgressBar";

export default function Page() {
  const { authToken, isAuthenticated } = useDynamicContext();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (authToken) {
      setJwt(authToken, searchParams.get("next"));
    }
  }, [authToken, searchParams]);

  if (isAuthenticated) {
    return (
      <div className="fixed top-0 right-0 bottom-0 left-0 flex justify-center items-center">
        <div>
          <div className="rounded-full overflow-hidden flex justify-center items-center m-6">
            <DotLottiePlayer
              className="w-32 h-32"
              loop
              autoplay
              src="/lottie/chomp.lottie"
            />
          </div>
          <ProgressBar className="mt-4" />
          <div className="text-center font-sora text-sm mt-4">
            Loading your chomps...
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col justify-center items-center gap-3 h-full">
      <DynamicConnectButton buttonClassName="bg-primary text-btn-text-primary rounded-lg inline-flex justify-center py-4 px-16 rounded-2xl font-bold text-base">
        Connect Wallet
      </DynamicConnectButton>
      <p className="text-[13px]">Connect your wallet to begin</p>
    </main>
  );
}
