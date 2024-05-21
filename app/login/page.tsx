"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

import { getJwtPayload, setJwt } from "../actions/jwt";
import ExistingUserScreen from "./screens/ExistingUserScreen";
import LoadingScreen from "./screens/LoadingScreen";
import NewUserScreen from "./screens/NewUserScreen";
import SlideshowScreen from "./screens/SlideshowScreen";

export default function Page() {
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

  if (isAuthenticated && !isNewUser) return <ExistingUserScreen />;

  if (isAuthenticated && isNewUser) return <NewUserScreen />;

  return <SlideshowScreen />;
}
