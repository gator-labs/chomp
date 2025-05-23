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
  archivedDay: number;
  archivedWeek: number;
  archivedMonth: number;
  archivedAllTime: number;
  pendingDay: number;
  pendingWeek: number;
  pendingMonth: number;
  pendingAllTime: number;
};

type CommunityAskPeriodStatsFromDb = {
  [K in keyof CommunityAskPeriodStats]: number | bigint;
};

const convertBigInts = (
  input: CommunityAskPeriodStatsFromDb,
): CommunityAskPeriodStats =>
  Object.fromEntries(
    Object.entries(input).map((entry) => [entry[0], Number(entry[1])]),
  ) as CommunityAskPeriodStats;

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
      COUNT(CASE WHEN dq."deckId" IS NULL AND q."isArchived" IS FALSE AND dq."createdAt" >= ${startOfDay}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "pendingDay",
      COUNT(CASE WHEN dq."deckId" IS NULL AND q."isArchived" IS FALSE AND dq."createdAt" >= ${startOfWeek}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "pendingWeek",
      COUNT(CASE WHEN dq."deckId" IS NULL AND q."isArchived" IS FALSE AND dq."createdAt" >= ${startOfMonth}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "pendingMonth",
      COUNT(CASE WHEN dq."deckId" IS NULL AND q."isArchived" IS FALSE THEN 1 ELSE NULL END) AS "pendingAllTime",
      COUNT(CASE WHEN q."isArchived" IS TRUE AND q."updatedAt" >= ${startOfDay}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "archivedDay",
      COUNT(CASE WHEN q."isArchived" IS TRUE AND q."updatedAt" >= ${startOfWeek}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "archivedWeek",
      COUNT(CASE WHEN q."isArchived" IS TRUE AND q."updatedAt" >= ${startOfMonth}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "archivedMonth",
      COUNT(CASE WHEN q."isArchived" IS TRUE THEN 1 ELSE NULL END) AS "archivedAllTime",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfDay}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedDay",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfWeek}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedWeek",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL AND dq."createdAt" >= ${startOfMonth}::TIMESTAMPTZ THEN 1 ELSE NULL END) AS "acceptedMonth",
      COUNT(CASE WHEN dq."deckId" IS NOT NULL THEN 1 ELSE NULL END) AS "acceptedAllTime"
    FROM public."Question" q
    LEFT JOIN public."DeckQuestion" dq
    ON q.id = dq."questionId"
    WHERE q."isSubmittedByUser" IS TRUE
    AND q."createdByUserId" IS NOT NULL
  `) as CommunityAskPeriodStatsFromDb[];

  if (stats.length === 0) throw new Error("Stats query failed.");

  return convertBigInts(stats[0]) as CommunityAskPeriodStats;
}
