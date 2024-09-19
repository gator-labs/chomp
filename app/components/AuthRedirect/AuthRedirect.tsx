import { getJwtPayload } from "@/app/actions/jwt";
import { getCurrentUser } from "@/app/queries/user";
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

  if (jwt && path?.includes("/admin")) {
    const currentUser = await getCurrentUser();
    if (currentUser?.isAdmin) {
      return null;
    }
    redirect("/application");
  }
  return null;
};
