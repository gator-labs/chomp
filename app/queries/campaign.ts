"use server";

import prisma from "../services/prisma";

export async function getCampaigns() {
  return prisma.campaign.findMany({
    where: {
      isVisible: true,
    },
    orderBy: [{ name: "asc" }],
  });
}

export async function getCampaign(id: number) {
  return prisma.campaign.findUnique({
    where: {
      id,
      isActive: true,
      isVisible: true,
    },
    include: {
      deck: true,
    },
  });
}
