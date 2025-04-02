import { SENTRY_FLUSH_WAIT } from "@/app/constants/sentry";
import prisma from "@/app/services/prisma";
import { EThreatLevelType } from "@/types/bots";
import * as Sentry from "@sentry/nextjs";

/**
 * Marks the given list of suspected bot users as
 * bots, without overwriting existing threat levels.
 *
 * @param bots                Array of user IDs.
 * @param analysisWindowStart Start of period used for analysis.
 * @param analysisWindowEnd   End of period used for analysis.
 */
export const updateBots = async (
  bots: string[],
  analysisWindowStart: Date,
  analysisWindowEnd: Date,
) => {
  const reoffenders = await prisma.user.findMany({
    where: {
      id: { in: bots },
      threatLevel: EThreatLevelType.ManualAllow,
      OR: [
        { threatLevelWindow: null },
        { threatLevelWindow: { lt: analysisWindowStart } },
      ],
    },
  });

  if (reoffenders.length > 0) {
    Sentry.captureMessage(
      `Bot users marked as "manual-allow" caught reoffending; marking as bots again...`,
      {
        level: "info",
        tags: {
          category: "reoffending-bots",
        },
        extra: {
          reoffenders,
        },
      },
    );
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  await prisma.user.updateMany({
    data: {
      threatLevel: EThreatLevelType.Bot,
      threatLevelWindow: analysisWindowEnd,
    },
    where: {
      id: { in: bots },
      AND: [
        {
          OR: [
            { threatLevel: null },
            { threatLevel: EThreatLevelType.ManualAllow },
          ],
        },
        {
          OR: [
            { threatLevelWindow: null },
            { threatLevelWindow: { lt: analysisWindowStart } },
          ],
        },
      ],
    },
  });
};
