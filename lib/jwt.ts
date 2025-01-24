import prisma from "@/app/services/prisma";
import { revokeDynamicSession } from "@/lib/dynamic";
import { UserThreatLevelDetected } from "@/lib/error";
import { cookies } from "next/headers";

export const checkThreatLevel = async (userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.threatLevel) {
    await revokeDynamicSession(userId);
    throw new UserThreatLevelDetected("User threat level detected");
  }
};

export const getTokenFromCookie = () => {
  return cookies().get("token");
};
