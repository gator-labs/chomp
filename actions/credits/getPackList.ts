"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";

export async function getCreditPackList() {
  const payload = await getJwtPayload();
  if (!payload) return null;

  return await prisma.creditPack.findMany({
    orderBy: { amount: "desc" },
    where: { isActive: true },
  });
}
