import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import "server-only";

export const getCampaignBoxes = async () => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  return await prisma.campaignMysteryBox.findMany();
};
