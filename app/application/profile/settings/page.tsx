import { updateProfile } from "@chomp/app/actions/profile";
import { ProfileForm } from "@chomp/app/components/ProfileForm/ProfileForm";
import { getProfile } from "@chomp/app/queries/profile";
import { profileSchema } from "@chomp/app/schemas/profile";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { z } from "zod";

export default async function Page() {
  const profile = await getProfile();
  const path = headers().get("x-path");

  if (!profile) {
    if (!path) {
      return redirect("/login");
    }
    return redirect(`/login?next=${encodeURIComponent(path)}`);
  }

  return (
    <ProfileForm
      profile={profile as z.infer<typeof profileSchema>}
      action={updateProfile}
    />
  );
}
