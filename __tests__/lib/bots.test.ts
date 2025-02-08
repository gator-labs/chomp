import prisma from "@/app/services/prisma";
import { updateBots } from "@/lib/bots";
import { generateUsers } from "@/scripts/utils";

describe("Update bot list", () => {
  let users: { username: string; id: string }[] = [];
  let userIds: string[] = [];

  beforeAll(async () => {
    users = await generateUsers(8);

    userIds = users.map((user) => user.id);

    await prisma.user.createMany({
      data: users,
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: "bot",
      },
      where: {
        id: { in: [userIds[0], userIds[1]] },
      },
    });

    await prisma.user.updateMany({
      data: {
        threatLevel: "manual-allow",
      },
      where: {
        id: { in: [userIds[2], userIds[3]] },
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
    await updateBots([
      userIds[0],
      userIds[1],
      userIds[2],
      userIds[3],
      userIds[4],
      userIds[5],
    ]);

    const records = await prisma.user.findMany({
      select: { id: true, threatLevel: true },
      where: { id: { in: userIds } },
    });

    const userState = Object.fromEntries(
      records.map((user) => [user.id, user.threatLevel]),
    );

    // Should both still be bot
    expect(userState[userIds[0]]).toBe("bot");
    expect(userState[userIds[1]]).toBe("bot");

    // Should both still be manual-allow
    expect(userState[userIds[2]]).toBe("manual-allow");
    expect(userState[userIds[3]]).toBe("manual-allow");

    // Should have changed to bot
    expect(userState[userIds[4]]).toBe("bot");
    expect(userState[userIds[5]]).toBe("bot");

    // Should be untouched
    expect(userState[userIds[6]]).toBeNull();
    expect(userState[userIds[7]]).toBeNull();
  });
});
