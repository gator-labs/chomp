"use client";

import { setJwt } from "@/app/actions/jwt";
import { MIX_PANEL_EVENTS } from "@/app/constants/mixpanel";
import { DynamicJwtPayload } from "@/lib/auth";
import sendToMixpanel from "@/lib/mixpanel";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import ExistingUserScreen from "./ExistingUserScreen";
import LoadingScreen from "./LoadingScreen";
import NewUserScreen from "./NewUserScreen";
import SlideshowScreen from "./SlideshowScreen";

interface Props {
  hasDailyDeck: boolean;
  payload: DynamicJwtPayload | null;
}

const LoginScreen = ({ hasDailyDeck, payload }: Props) => {
  const {
    authToken,
    isAuthenticated,
    awaitingSignatureState,
    walletConnector,
  } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (awaitingSignatureState === "linking_new_wallet") {
      setIsLoading(true);
    }

    if (authToken) setJwt(authToken);

    if (!!payload?.sub && !!authToken && awaitingSignatureState === "idle") {
      if (!!walletConnector)
        sendToMixpanel(MIX_PANEL_EVENTS.WALLET_CONNECTED, {
          walletConnectorName: walletConnector.name,
        });

      setIsLoading(false);
    }

    if (!payload?.sub && !authToken && awaitingSignatureState === "idle")
      setIsLoading(false);
  }, [authToken, payload?.sub, awaitingSignatureState]);

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated && !payload?.new_user)
    return <ExistingUserScreen hasDailyDeck={hasDailyDeck} />;

  if (isAuthenticated && payload?.new_user) return <NewUserScreen />;

  return <SlideshowScreen />;
};

export default LoginScreen;
