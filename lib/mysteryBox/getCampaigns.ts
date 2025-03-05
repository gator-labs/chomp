import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { EMysteryBoxStatus } from "@prisma/client";
import "server-only";

/**
 * @description Get new and unclaimed campaigns allowed for user
 * @returns {Array<Object>} An array containing a single object with item details
 * @returns {string} returns[0].id - Unique identifier for the item
 * @returns {string} returns[0].name - Name of the item
 * @returns {string} returns[0].infoTitle - Title of the item's information
 * @returns {string} returns[0].infoBody - Body text of the item's information
 * @returns {boolean} returns[0].isEligible - Eligibility status of the item
 */
export const getCampaigns = async () => {
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
