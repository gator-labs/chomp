import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { EMysteryBoxStatus } from "@prisma/client";
import "server-only";

/**
 * Get new and unclaimed campaigns allowed for user
 */
export const getCampaigns = async (): Promise<Array<{
  id: string;
  name: string;
  infoTitle: string;
  infoBody: string;
  isEligible: boolean;
}> | null> => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userWallet = await prisma.wallet.findFirst({
    where: { userId: payload.sub },
    select: {
      address: true,
    },
  });

  if (!userWallet) return null;

  const campaignBoxes = await prisma.campaignMysteryBox.findMany({
    where: { enabled: true },
  });

  const validCampaignBoxes = await prisma.campaignMysteryBoxAllowlist.findMany({
    where: {
      address: userWallet.address,
    },
    select: {
      id: true,
      campaignMysteryBoxId: true,
    },
  });

  const openedMysteryBoxes = await prisma.mysteryBoxTrigger.findMany({
    where: {
      campaignMysteryBoxId: {
        in: validCampaignBoxes.map((eb) => eb.campaignMysteryBoxId),
      },
      MysteryBox: {
        userId: payload?.sub,
      },
    },
    include: {
      MysteryBox: {
        where: {
          status: { in: [EMysteryBoxStatus.Opened] },
          userId: payload.sub,
        },
      },
    },
  });

  const claimedCampaignIds = openedMysteryBoxes.map((epb) =>
    epb.MysteryBox ? epb.campaignMysteryBoxId : null,
  );

  const campaignBoxIds = new Set(
    validCampaignBoxes.map((eb) => eb.campaignMysteryBoxId),
  );

  const updatedData = campaignBoxes.map((cb) => ({
    ...cb,
    isEligible:
      campaignBoxIds.has(cb.id) && !claimedCampaignIds.includes(cb.id),
  }));

  return updatedData;
};
