import prisma from "@/app/services/prisma";
import { deleteAllDBTestData } from "@/lib/db";
import { createCampaignMysteryBox } from "@/lib/mysteryBox/createCampaignMysteryBox";
import { getShared, resetShared } from "@/lib/shareable";
import { generateUsers } from "@/scripts/utils";
import { faker } from "@faker-js/faker";

describe("createCampaignMysteryBox", () => {
  let user: { id: string; username: string; wallet: string };
  let campaign: { id: string };
  let shared: { mysteryBoxId?: string };

  beforeAll(async () => {
    resetShared();
    shared = getShared();
    await deleteAllDBTestData();

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
        boxType: "Bis1",
      },
    });

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

  it("should create a campaign mystery box", async () => {
    console.log("1 ============================");
    const res = await createCampaignMysteryBox(user.id, campaign.id);

    if (res) {
      shared.mysteryBoxId = res?.[0];
      console.log("mysteryBoxId", shared.mysteryBoxId);
    }

    expect(Array.isArray(res)).toBe(true);
    expect(res?.length).toBe(1);
    expect(typeof res?.[0]).toBe("string");
  });

  it("should retun an existing campaign mystery box", async () => {
    console.log("2 ===============================");
    const res = await createCampaignMysteryBox(user.id, campaign.id);
    console.log("mysteryBoxId2", shared.mysteryBoxId);

    expect(Array.isArray(res)).toBe(true);
    expect(res?.length).toBe(1);
    expect(typeof res?.[0]).toBe("string");
    expect(res?.[0]).toBe(shared.mysteryBoxId);
  });
});
