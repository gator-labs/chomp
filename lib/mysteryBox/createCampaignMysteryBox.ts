import prisma from "@/app/services/prisma";
import "server-only";

export const createCampaignMysteryBox = async (address: string) => {
  const campaignBoxes = await prisma.campaignMysteryBoxAllowed.findMany({
    where: {
      allowlistAddress: address,
    },
  });

  console.log(campaignBoxes);
};
