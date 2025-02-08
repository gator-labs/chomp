import prisma from "@/app/services/prisma";

/**
 * Marks the given list of suspected bot users as
 * bots, without overwriting existing threat levels.
 *
 * @param bots Array of user IDs.
 */
export const updateBots = async (bots: string[]) => {
  await prisma.user.updateMany({
    data: {
      threatLevel: "bot",
    },
    where: {
      id: { in: bots },
      threatLevel: null,
    },
  });
};
