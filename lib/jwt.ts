import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { revokeDynamicSession } from "@/lib/dynamic";
import {
  DynamicRevokeSessionError,
  UserThreatLevelDetected,
} from "@/lib/error";
import * as Sentry from "@sentry/nextjs";
import { cookies } from "next/headers";

export const checkThreatLevel = async (userId: string) => {
  const user = await prisma.user.findFirst({ where: { id: userId } });
  if (!user) throw new Error("User not found");
  if (user.threatLevel) {
    try {
      await revokeDynamicSession(userId);
    } catch (e) {
      const dynamicRevokeSessionError = new DynamicRevokeSessionError(
        `Failed revoke session for user with threat level: ${userId}`,
        { cause: e },
      );
      Sentry.captureException(dynamicRevokeSessionError);
      await Sentry.flush(SENTRY_FLUSH_WAIT);
    }
    throw new UserThreatLevelDetected("User threat level detected");
  }
};

export const getTokenFromCookie = () => {
  return cookies().get("token");
};
