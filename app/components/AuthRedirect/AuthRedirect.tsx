import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
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
    const isAdmin = await getIsUserAdmin();

    if (!isAdmin) {
      redirect("/application");
    }
  }
  return null;
};
