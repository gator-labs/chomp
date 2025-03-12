"server-only";

import prisma from "@/app/services/prisma";

export async function getCreditPack(packId: string) {
  return await prisma.creditPack.findUniqueOrThrow({
    where: {
      id: packId,
      isActive: true,
    },
  });
}
