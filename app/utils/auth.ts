import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getJwtPayload } from "../actions/jwt";

export async function authGuard() {
  const jwt = await getJwtPayload();
  const path = headers().get("x-path");

  if (!jwt) {
    if (!path || path === "/application") {
      redirect("/login");
    }
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }

  return jwt;
}
