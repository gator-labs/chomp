import { ProfileForm } from "@/app/components/ProfileForm/ProfileForm";
import { getProfile } from "@/app/queries/profile";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const profile = await getProfile();
  const path = headers().get("x-path");

  if (!profile) {
    if (!path) {
      return redirect("/login");
    }
    return redirect(`/login?next=${encodeURIComponent(path!)}`);
  }

  return <ProfileForm profile={profile} />;
}
