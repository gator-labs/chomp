import { getJwtPayload } from "@/app/actions/jwt";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const AuthRedirect = async () => {
  const jwt = await getJwtPayload();
  const path = headers().get("x-path");

  if (!jwt) {
    if (!path || path === "/application") {
      redirect("/login");
    }
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }

  return null;
};
