import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";

export type ProfileData = {
  userId: string;
  email: string;
  createdAt?: Date;
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
    createdAt: user?.createdAt,
    email: user?.emails.length ? user?.emails[0].address : "",
    username: user?.username,
    firstName: user?.firstName,
    lastName: user?.lastName,
    profileSrc: user?.profileSrc || AvatarPlaceholder.src,
  };

  return profile;
}

export async function getProfileImage() {
  const payload = await getJwtPayload();

  if (!payload) {
    return AvatarPlaceholder.src;
  }

  const profile = await prisma.user.findFirst({
    where: { id: { equals: payload.sub } },
    select: { profileSrc: true },
  });

  return profile?.profileSrc ?? AvatarPlaceholder.src;
}
