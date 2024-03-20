"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

export function LogoutButton() {
  const { handleLogOut } = useDynamicContext();

  return <button onClick={() => handleLogOut()}>Log out</button>;
}
