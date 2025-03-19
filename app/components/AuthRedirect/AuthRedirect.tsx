import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const AuthRedirect = async () => {
  const jwt = await getJwtPayload();
  const path = headers().get("x-path");

  // add any path logged off users should be able to see here
  const pathExceptionsOfAuthRedirect = ["/decks"];
  let pathExemptOfAuthR = false;
  for (let i = 0; i < pathExceptionsOfAuthRedirect.length; i++) {
    if (path?.includes(pathExceptionsOfAuthRedirect[i])) {
      pathExemptOfAuthR = true;
    }
  }

  if (!jwt && !pathExemptOfAuthR) {
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
