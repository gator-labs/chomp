"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { redirect, usePathname } from "next/navigation";
import { useEffect } from "react";

export const AuthRedirect = () => {
  const pathname = usePathname();
  const { user } = useDynamicContext();

  useEffect(() => {
    if (!user && pathname !== "/login") {
      redirect("/login");
    }
  }, [user, pathname]);

  return <></>;
};
