"server-only";

import prisma from "@/app/services/prisma";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export type CommunityAskPeriodStats = {
  submittedDay: number;
  submittedWeek: number;
  submittedMonth: number;
  submittedAllTime: number;
  acceptedDay: number;
  acceptedWeek: number;
  acceptedMonth: number;
  acceptedAllTime: number;
};

export async function getCommunityAskStats(): Promise<CommunityAskPeriodStats> {
  const startOfDay = dayjs().startOf("day").utc().toISOString();
  const startOfWeek = dayjs().startOf("week").utc().toISOString();
  const startOfMonth = dayjs().startOf("month").utc().toISOString();

  const stats = (await prisma.$queryRaw`
    SELECT
      COUNT(CASE WHEN q."createdAt" >= ${startOfDay}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "submittedDay",
      COUNT(CASE WHEN q."createdAt" >= ${startOfWeek}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "submittedWeek",
      COUNT(CASE WHEN q."createdAt" >= ${startOfMonth}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "submittedMonth",
      COUNT(*) AS "submittedAllTime",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfDay}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedDay",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfWeek}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedWeek",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfMonth}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedMonth",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL THEN 1 ELSE NULL END) AS "acceptedAllTime"
    FROM "Question" q
    LEFT JOIN "DeckQuestion" dq
    ON q.id = dq."questionId"
    WHERE q."isSubmittedByUser" IS TRUE
    AND q."createdByUserId" IS NOT NULL
  `) as CommunityAskPeriodStats[];

  if (stats.length === 0) throw new Error("Stats query failed.");

  return stats[0];
}
