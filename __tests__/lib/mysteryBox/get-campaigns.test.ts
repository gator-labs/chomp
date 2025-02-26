import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { getCampaigns } from "@/lib/mysteryBox/getCampaigns";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";

jest.mock("@/app/actions/jwt", () => ({
  getJwtPayload: jest.fn(),
}));

describe("getCampaigns", () => {
  let user: { id: string; username: string; wallet: string };
  let campaign: { id: string };

  beforeAll(async () => {
    const users = await generateUsers(1);
    user = {
      id: users[0].id,
      username: users[0].username,
      wallet: faker.string.hexadecimal({ length: { min: 32, max: 42 } }),
    };

    await prisma.user.createMany({
      data: users,
    });

    await prisma.wallet.createMany({
      data: [{ userId: user.id, address: user.wallet }],
    });
    campaign = await prisma.campaignMysteryBox.create({
      data: {
        name: "test",
        infoBody: "test",
        infoTitle: "test",
      },
    });
  });

  afterAll(async () => {
    await prisma.campaignMysteryBoxAllowlist.deleteMany({
      where: {
        campaignMysteryBoxId: campaign.id,
      },
    });
    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user.wallet] },
      },
    });
    await prisma.campaignMysteryBox.delete({
      where: {
        id: campaign.id,
      },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("should return a campaign where user is not eligible", async () => {
    // Arrange

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });

    // Act
    const campaigns = await getCampaigns();

    // Assert
    const returnedNewCampaign = campaigns?.filter(
      (campaign) => campaign.id === campaign.id,
    );

    expect(returnedNewCampaign).toBeDefined();
    expect(returnedNewCampaign?.[0].isEligible).toEqual(false);
  });

  it("should return a campaign where user eligible", async () => {
    await prisma.mysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
      },
    });

    await prisma.campaignMysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
        campaignMysteryBoxId: campaign.id,
      },
    });

    // Arrange
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });

    // Act
    const campaigns = await getCampaigns();

    // Assert
    const returnedNewCampaign = campaigns?.filter(
      (cp) => cp.id === campaign.id,
    );

    expect(returnedNewCampaign).toBeDefined();
    expect(returnedNewCampaign?.[0].isEligible).toEqual(true);
  });
});
