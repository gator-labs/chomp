"use server";

import { cookies } from "next/headers";

import prisma from "../services/prisma";

export async function getBanners() {
  return prisma.banner.findMany({});
}

/**
 * Gets the next banner that the user hasn't seen.
 *
 * @return banner Banner from the database.
 */
export async function getActiveBanner() {
  const lastBannerCookie = cookies().get("lastbanner");
  const lastBannerId = lastBannerCookie
    ? Number(lastBannerCookie.value)
    : undefined;

  return prisma.banner.findFirst({
    where: {
      isActive: true,
      id: { gt: lastBannerId ?? 0 },
    },
    orderBy: [{ createdAt: "asc" }],
  });
}

export async function getBanner(id: number) {
  return prisma.banner.findUnique({
    where: {
      id,
    },
  });
}

export async function updateLastSeenBanner(id: number) {
  cookies().set("lastbanner", String(id));
}
