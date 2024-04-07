"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { Button } from "../Button/Button";

export function LogoutButton() {
  const { handleLogOut } = useDynamicContext();

  return (
    <Button variant="white" isPill onClick={handleLogOut}>
      Log out
    </Button>
  );
}
