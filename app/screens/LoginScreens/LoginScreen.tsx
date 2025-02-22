"use client";

import { setJwt } from "@/app/actions/jwt";
import { TRACKING_EVENTS } from "@/app/constants/tracking";
import { DynamicJwtPayload } from "@/lib/auth";
import trackEvent from "@/lib/trackEvent";
import { useDynamicContext, useIsLoggedIn } from "@dynamic-labs/sdk-react-core";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ConnectWalletScreen from "./ConnectWalletScreen";
import LoadingScreen from "./LoadingScreen";
import NewUserScreen from "./NewUserScreen";

interface Props {
  hasDailyDeck: boolean;
  payload: DynamicJwtPayload | null;
}

const LoginScreen = ({ payload }: Props) => {
  const { authToken, awaitingSignatureState, primaryWallet, sdkHasLoaded } =
    useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const params = useSearchParams();

  const isExistingUser = isLoggedIn && !payload?.new_user;

  useEffect(() => {
    setIsLoading(true);

    if (authToken) {
      setJwt(authToken, null);
    }

    if (!!payload?.sub && !!authToken && awaitingSignatureState === "idle") {
      if (!!primaryWallet?.connector)
        trackEvent(TRACKING_EVENTS.WALLET_CONNECTED, {
          walletConnectorName: primaryWallet?.connector?.name,
        });

      setIsLoading(false);
    }

    if (!!payload?.sub && !!authToken && awaitingSignatureState === "idle") {
      const destination = params.get("next");
      if (!!destination) {
        redirect(destination);
      } else {
        setIsLoading(false);
      }
    }

    if (!payload?.sub && !authToken && awaitingSignatureState === "idle")
      setIsLoading(false);
  }, [authToken, payload?.sub, awaitingSignatureState, sdkHasLoaded]);

  useEffect(() => {
    if (isExistingUser && !isLoading) router.push("/application");
  }, [isExistingUser, isLoading]);

  if (isLoading) return <LoadingScreen />;

  if (isExistingUser) {
    return <LoadingScreen />;
  }

  if (isLoggedIn && payload?.new_user) return <NewUserScreen />;

  return <ConnectWalletScreen />;
};

export default LoginScreen;
