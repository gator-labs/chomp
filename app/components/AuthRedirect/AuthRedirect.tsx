import { redirect } from "next/navigation";
import { getJwtPayload } from "@/app/actions/jwt";

export const AuthRedirect = async () => {
  const jwt = await getJwtPayload();

  if (!jwt) {
    redirect("/login");
  }

  return null;
};
