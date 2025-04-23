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
  let enabledCampaign: { id: string };
  let disabledCampaign: { id: string };

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

    // Create an enabled campaign
    enabledCampaign = await prisma.campaignMysteryBox.create({
      data: {
        name: "enabled campaign",
        infoBody: "test enabled",
        infoTitle: "test enabled",
        boxType: "Bis1",
        enabled: true,
      },
    });

    // Create a disabled campaign
    disabledCampaign = await prisma.campaignMysteryBox.create({
      data: {
        name: "disabled campaign",
        infoBody: "test disabled",
        infoTitle: "test disabled",
        boxType: "Bis1",
        enabled: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.campaignMysteryBoxAllowlist.deleteMany({
      where: {
        campaignMysteryBoxId: { in: [enabledCampaign.id, disabledCampaign.id] },
      },
    });
    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user.wallet] },
      },
    });
    await prisma.campaignMysteryBox.deleteMany({
      where: {
        id: { in: [enabledCampaign.id, disabledCampaign.id] },
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
    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });

    const campaigns = await getCampaigns();

    const returnedEnabledCampaign = campaigns?.find(
      (campaign) => campaign.id === enabledCampaign.id,
    );

    expect(returnedEnabledCampaign).toBeDefined();
    expect(returnedEnabledCampaign?.isEligible).toEqual(false);
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
        campaignMysteryBoxId: enabledCampaign.id,
      },
    });

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });

    const campaigns = await getCampaigns();

    const returnedEnabledCampaign = campaigns?.find(
      (campaign) => campaign.id === enabledCampaign.id,
    );

    expect(returnedEnabledCampaign).toBeDefined();
    expect(returnedEnabledCampaign?.isEligible).toEqual(true);
  });

  it("should only return enabled campaigns", async () => {
    await prisma.campaignMysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
        campaignMysteryBoxId: disabledCampaign.id,
      },
    });

    (getJwtPayload as jest.Mock).mockResolvedValue({ sub: user.id });

    const campaigns = await getCampaigns();

    // Should find the enabled campaign
    const returnedEnabledCampaign = campaigns?.find(
      (campaign) => campaign.id === enabledCampaign.id,
    );
    expect(returnedEnabledCampaign).toBeDefined();

    // Should NOT find the disabled campaign
    const returnedDisabledCampaign = campaigns?.find(
      (campaign) => campaign.id === disabledCampaign.id,
    );
    expect(returnedDisabledCampaign).toBeUndefined();

    // all returned campaigns should have enabled=true
    expect(campaigns?.length).toBeGreaterThan(0);
    expect(
      campaigns?.every((campaign) => campaign.id !== disabledCampaign.id),
    ).toBe(true);
  });
});
