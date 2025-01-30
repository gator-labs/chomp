import prisma from "@/app/services/prisma";
import { UserThreatLevelDetected } from "@/lib/error";
import { cookies } from "next/headers";

export const checkThreatLevel = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { wallets: true },
  });
  if (!user) throw new Error("User not found");
  if (user.threatLevel) {
    throw new UserThreatLevelDetected(
      `User threat level detected: user: ${user.id}, wallet: ${user.wallets?.[0]?.address}, level: ${user.threatLevel}`,
    );
  }
};

export const getTokenFromCookie = () => {
  return cookies().get("token");
};
