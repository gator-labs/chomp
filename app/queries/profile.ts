import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";

export type ProfileData = {
  userId: string;
  email: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileSrc?: string | null;
};

export async function getProfile() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: { id: { equals: payload.sub } },
    include: { emails: true },
  });

  const profile: ProfileData = {
    userId: payload.sub,
    email: user?.emails.length ? user?.emails[0].address : "",
    username: user?.username,
    firstName: user?.firstName,
    lastName: user?.lastName,
    profileSrc: user?.profileSrc,
  };

  return profile;
}
