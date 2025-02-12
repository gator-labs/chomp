"use client";

import { DynamicJwtPayload } from "@/lib/auth";
import trackEvent from "@/lib/trackEvent";
import {
  useDynamicContext,
  useIsLoggedIn,
} from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import LoadingScreen from "./LoadingScreen";
import NewUserScreen from "./NewUserScreen";
import SlideshowScreen from "./SlideshowScreen";
import { setJwt } from "@/app/actions/jwt";

interface Props {
  hasDailyDeck: boolean;
  payload: DynamicJwtPayload | null;
}

const LoginScreen = ({ payload }: Props) => {
  const {
    authToken,
    awaitingSignatureState,
    sdkHasLoaded,
  } = useDynamicContext();

  const isLoggedIn = useIsLoggedIn();

  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const isExistingUser = isLoggedIn && !payload?.new_user;

  useEffect(() => {
    setIsLoading(true);

    if (authToken) {
      setJwt(authToken, null);
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

  return <SlideshowScreen />;
};

export default LoginScreen;
