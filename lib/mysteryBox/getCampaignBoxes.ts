import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { EMysteryBoxStatus } from "@prisma/client";
import "server-only";

export const getCampaignBoxes = async () => {
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

  const campaignBoxes = await prisma.campaignMysteryBox.findMany();

  const validCampaignBoxes = await prisma.campaignMysteryBoxAllowed.findMany({
    where: {
      allowlistAddress: userWallet.address,
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
    },
    include: {
      MysteryBox: {
        where: {
          status: { in: [EMysteryBoxStatus.Opened] },
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
