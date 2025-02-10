import prisma from "@/app/services/prisma";
import { updateBots } from "@/lib/bots";
import { generateUsers } from "@/scripts/utils";
import { EThreatLevelType } from "@/types/bots";
import dayjs from "dayjs";

describe("Update bot list", () => {
  let users: { username: string; id: string }[] = [];
  let userIds: string[] = [];

  const windowStart = dayjs().subtract(5, "day").toDate();
  const windowEnd = new Date();

  beforeAll(async () => {
    users = await generateUsers(10);

    userIds = users.map((user) => user.id);

    await prisma.user.createMany({
      data: users,
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: EThreatLevelType.Bot,
      },
      where: {
        id: { in: [userIds[0], userIds[1]] },
      },
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: EThreatLevelType.ManualAllow,
      },
      where: {
        id: { in: [userIds[2], userIds[3]] },
      },
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: EThreatLevelType.ManualBlock,
      },
      where: {
        id: { in: [userIds[4], userIds[5]] },
      },
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: EThreatLevelType.PermanentAllow,
      },
      where: {
        id: { in: [userIds[6], userIds[7]] },
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  });

  it("should update bot lists", async () => {
    await updateBots(
      [
        userIds[0],
        userIds[1],
        userIds[2],
        userIds[3],
        userIds[4],
        userIds[5],
        userIds[6],
        userIds[7],
      ],
      windowStart,
      windowEnd,
    );

    const records = await prisma.user.findMany({
      select: { id: true, threatLevel: true },
      where: { id: { in: userIds } },
    });

    const userState = Object.fromEntries(
      records.map((user) => [user.id, user.threatLevel]),
    );

    // Should both still be bot
    expect(userState[userIds[0]]).toBe(EThreatLevelType.Bot);
    expect(userState[userIds[1]]).toBe(EThreatLevelType.Bot);

    // Should be flipped to bot
    expect(userState[userIds[2]]).toBe(EThreatLevelType.Bot);
    expect(userState[userIds[3]]).toBe(EThreatLevelType.Bot);

    // Should stay manual-block (i.e. still blocked, but retain flag)
    expect(userState[userIds[4]]).toBe(EThreatLevelType.ManualBlock);
    expect(userState[userIds[5]]).toBe(EThreatLevelType.ManualBlock);

    // Should stay permanent-allow
    expect(userState[userIds[6]]).toBe(EThreatLevelType.PermanentAllow);
    expect(userState[userIds[7]]).toBe(EThreatLevelType.PermanentAllow);

    // Should be untouched
    expect(userState[userIds[8]]).toBeNull();
    expect(userState[userIds[9]]).toBeNull();
  });

  it("should not update threat level again in the same analysis window", async () => {
    await prisma.user.updateMany({
      data: {
        threatLevel: null,
      },
      where: { id: { in: userIds } },
    });

    await updateBots([userIds[0], userIds[1]], windowStart, windowEnd);

    const records = await prisma.user.findMany({
      select: { id: true, threatLevel: true },
      where: { id: { in: userIds } },
    });

    const userState = Object.fromEntries(
      records.map((user) => [user.id, user.threatLevel]),
    );

    // Should both still be bot
    expect(userState[userIds[0]]).toBeNull();
    expect(userState[userIds[1]]).toBeNull();
  });
});
