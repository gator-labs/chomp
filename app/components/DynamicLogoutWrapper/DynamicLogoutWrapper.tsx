"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "../Button/Button";

export function DynamicLogoutWrapper() {
  const { handleLogOut } = useDynamicContext();

  return (
    <Button
      onClick={async () => {
        handleLogOut();
        fetch("/auth/logout", {
          method: "POST",
        });
      }}
      variant="primary"
    >
      Log out
    </Button>
  );
}
