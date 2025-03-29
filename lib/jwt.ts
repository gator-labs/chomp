import prisma from "@/app/services/prisma";
import { UserThreatLevelDetected } from "@/lib/error";
import { EThreatLevelAction, EThreatLevelType } from "@/types/bots";
import { cookies } from "next/headers";

export const checkThreatLevel = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: { wallets: true },
  });
  if (!user) throw new Error("User not found");
  if (
    user.threatLevel === EThreatLevelType.Bot ||
    user.threatLevel === EThreatLevelType.ManualBlock ||
    user.threatLevel === EThreatLevelType.EngBlock
  ) {
    const action =
      user.threatLevel === EThreatLevelType.EngBlock
        ? EThreatLevelAction.Forbidden
        : EThreatLevelAction.Unavailable;

    throw new UserThreatLevelDetected(
      `User threat level detected: user ${userId}, username: ${user.username}, wallet: ${user.wallets?.[0]?.address}`,
      { cause: { userId, source: "JWT", action } },
    );
  }
};

export const getTokenFromCookie = () => {
  return cookies().get("token");
};
