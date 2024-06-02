"use client";

import { getJwtPayload, setJwt } from "@/app/actions/jwt";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import ExistingUserScreen from "./ExistingUserScreen";
import LoadingScreen from "./LoadingScreen";
import NewUserScreen from "./NewUserScreen";
import SlideshowScreen from "./SlideshowScreen";

interface Props {
  hasDailyDeck: boolean;
}

const LoginScreen = ({ hasDailyDeck }: Props) => {
  const { authToken, isAuthenticated } = useDynamicContext();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIsNewUser = async () => {
      const payload = await getJwtPayload();

      setIsNewUser(payload?.new_user || false);
      setIsLoading(false);
    };

    if (authToken) {
      setIsLoading(true);

      setJwt(authToken);
      checkIsNewUser();
      return;
    }

    setIsLoading(false);
  }, [authToken]);

  if (isLoading) return <LoadingScreen />;

  if (isAuthenticated && !isNewUser)
    return <ExistingUserScreen hasDailyDeck={hasDailyDeck} />;

  if (isAuthenticated && isNewUser) return <NewUserScreen />;

  return <SlideshowScreen />;
};

export default LoginScreen;
