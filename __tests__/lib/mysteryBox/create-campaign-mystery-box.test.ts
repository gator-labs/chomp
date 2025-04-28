import prisma from "@/app/services/prisma";
import { createCampaignMysteryBox } from "@/lib/mysteryBox/createCampaignMysteryBox";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";

describe("createCampaignMysteryBox", () => {
  let user: { id: string; username: string; wallet: string };
  let campaign: { id: string };
  let disabledCampaign: { id: string };
  let mysteryBoxId: string;

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
    campaign = await prisma.campaignMysteryBox.create({
      data: {
        name: "test",
        infoBody: "test",
        infoTitle: "test",
        boxType: "Bis1",
        isEnabled: true,
      },
    });

    // Create a disabled campaign
    disabledCampaign = await prisma.campaignMysteryBox.create({
      data: {
        name: "disabled test",
        infoBody: "disabled test",
        infoTitle: "disabled test",
        boxType: "Bis1",
        isEnabled: false,
      },
    });

    await prisma.mysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
      },
    });

    // Add user to both campaign allowlists
    await prisma.campaignMysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
        campaignMysteryBoxId: campaign.id,
      },
    });

    await prisma.campaignMysteryBoxAllowlist.create({
      data: {
        address: user.wallet,
        campaignMysteryBoxId: disabledCampaign.id,
      },
    });
  });

  afterAll(async () => {
    // Clean up all created data
    await prisma.campaignMysteryBoxAllowlist.deleteMany({
      where: {
        campaignMysteryBoxId: { in: [campaign.id, disabledCampaign.id] },
      },
    });

    await prisma.mysteryBoxAllowlist.deleteMany({
      where: {
        address: { in: [user.wallet] },
      },
    });

    await prisma.campaignMysteryBox.deleteMany({
      where: {
        id: { in: [campaign.id, disabledCampaign.id] },
      },
    });

    await prisma.wallet.deleteMany({
      where: {
        userId: user.id,
      },
    });

    const mysteryBox = await prisma.mysteryBox.findMany({
      where: {
        userId: user.id,
      },
      include: {
        triggers: true,
      },
    });

    const trigger = mysteryBox.flatMap((mb) => mb.triggers);

    await prisma.mysteryBoxPrize.deleteMany({
      where: {
        mysteryBoxTriggerId: {
          in: trigger.map((tgId) => tgId.id),
        },
      },
    });

    await prisma.mysteryBoxTrigger.deleteMany({
      where: {
        id: {
          in: trigger.map((tgId) => tgId.id),
        },
      },
    });

    await prisma.mysteryBox.deleteMany({
      where: {
        id: {
          in: mysteryBox.map((mb) => mb.id),
        },
      },
    });

    await prisma.user.delete({
      where: {
        id: user.id,
      },
    });
  });

  it("should create a campaign mystery box for enabled campaign", async () => {
    const res = await createCampaignMysteryBox(user.id, campaign.id);

    if (res) {
      mysteryBoxId = res?.[0];
    }

    expect(Array.isArray(res)).toBe(true);
    expect(res?.length).toBe(1);
    expect(typeof res?.[0]).toBe("string");
  });

  it("should return an existing campaign mystery box", async () => {
    const res = await createCampaignMysteryBox(user.id, campaign.id);

    expect(Array.isArray(res)).toBe(true);
    expect(res?.length).toBe(1);
    expect(typeof res?.[0]).toBe("string");
    expect(res?.[0]).toBe(mysteryBoxId);
  });

  it("should throw an error for disabled campaign", async () => {
    await expect(
      createCampaignMysteryBox(user.id, disabledCampaign.id),
    ).rejects.toThrow("User is not eligible for reward");
  });
});
