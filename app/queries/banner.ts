"use server";

import prisma from "../services/prisma";

export async function getBanners() {
  return prisma.banner.findMany({
    orderBy: [{ title: "asc" }],
  });
}

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: {
      isActive: true,
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
