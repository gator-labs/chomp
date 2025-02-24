import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
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

  const eligibleBoxes = await prisma.campaignMysteryBoxAllowed.findMany({
    where: {
      allowlistAddress: userWallet.address,
    },
    select: {
      id: true,
      campaignMysteryBoxId: true,
    },
  });

  const campaignIds = new Set(
    eligibleBoxes.map((eb) => eb.campaignMysteryBoxId),
  );

  const updatedData = campaignBoxes.map((cb) => ({
    ...cb,
    isEligible: campaignIds.has(cb.id),
  }));

  return updatedData;
};
