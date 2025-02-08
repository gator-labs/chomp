import prisma from "@/app/services/prisma";

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
