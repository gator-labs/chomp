"use client";

import { setJwt } from "@/app/actions/jwt";
import { TRACKING_EVENTS, TRACKING_METADATA } from "@/app/constants/tracking";
import { TelegramAuthDataProps } from "@/app/login/page";
// import { TelegramAuthDataProps } from "@/app/login/page";
import { DynamicJwtPayload } from "@/lib/auth";
import trackEvent from "@/lib/trackEvent";
import { useIsLoggedIn, useTelegramLogin } from "@dynamic-labs/sdk-react-core";
import {
  useDynamicContext, // useTelegramLogin,
} from "@dynamic-labs/sdk-react-core";
import { redirect, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import ExistingUserScreen from "./ExistingUserScreen";
import LoadingScreen from "./LoadingScreen";
import NewUserScreen from "./NewUserScreen";
import SlideshowScreen from "./SlideshowScreen";

interface Props {
  hasDailyDeck: boolean;
  payload: DynamicJwtPayload | null;
  telegramAuthData?: TelegramAuthDataProps;
}

const LoginScreen = ({ payload, telegramAuthData }: Props) => {
  const {
    authToken,
    awaitingSignatureState,
    primaryWallet,
    user,
    sdkHasLoaded,
  } = useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

  const params = useSearchParams();
  const { telegramSignIn } = useTelegramLogin();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    if (authToken) {
      setJwt(authToken);
    }

    if (telegramAuthData) {
      trackEvent(TRACKING_EVENTS.TELEGRAM_USER_MINIAPP_OPENED, {
        [TRACKING_METADATA.TELEGRAM_FIRST_NAME]: telegramAuthData.firstName,
        [TRACKING_METADATA.TELEGRAM_LAST_NAME]: telegramAuthData.lastName,
        [TRACKING_METADATA.TELEGRAM_USERNAME]: telegramAuthData.username,
        [TRACKING_METADATA.TELEGRAM_ID]: telegramAuthData.id,
      });
      const signIn = async () => {
        if (!user) {
          await telegramSignIn({ forceCreateUser: true });
        }
        setIsLoading(false);
      };

      signIn();
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

  if (isLoading) return <LoadingScreen />;

  if (isLoggedIn && !payload?.new_user) return <ExistingUserScreen />;

  if (isLoggedIn && payload?.new_user) return <NewUserScreen />;

  return <SlideshowScreen />;
};

export default LoginScreen;
