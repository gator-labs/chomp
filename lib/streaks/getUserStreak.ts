import prisma from "@/app/services/prisma";
import "server-only";

export type Streak = {
  streakStartDate: Date;
  streakEndDate: Date;
  streakLength: number;
};

export async function getUserStreak(userId: string): Promise<Streak | null> {
  const streaks: Streak[] = await prisma.$queryRaw`
  WITH "userActivity" AS (
    SELECT DISTINCT DATE("createdAt") AS "activityDate",
    1 AS "streakValue"
    FROM public."ChompResult"
    WHERE "userId" = ${userId}
    UNION
    SELECT DISTINCT DATE("createdAt") AS "activityDate",
    1 AS "streakValue"
    FROM public."QuestionAnswer" qa
    WHERE "userId" = ${userId}
    AND qa."status" = 'Submitted'
    UNION
    SELECT DISTINCT DATE("createdAt") AS "activityDate",
    1 AS "streakValue"
    FROM public."FungibleAssetTransactionLog" fatl
    WHERE "userId" = ${userId}
    AND fatl."asset" = 'Credit'
    AND fatl."type" = 'CreditPurchase'
    UNION
    SELECT DISTINCT DATE("createdAt") AS "activityDate",
    1 AS "streakValue"
    FROM public."MysteryBox" mbox
    WHERE "userId" = ${userId}
    UNION
    SELECT DISTINCT DATE("createdAt") AS "activityDate",
    1 AS "streakValue"
    FROM public."Question" mbox
    WHERE "createdByUserId" = ${userId}
    UNION
    SELECT "activityDate", "streakValue"
    FROM public."StreakExtension" se
    WHERE "userId" IS NULL OR "userId" = ${userId}
  ),
  "consecutiveDays" AS (
    SELECT
      "activityDate",
  LAG("activityDate") OVER (ORDER BY "activityDate") AS "previousDate",
      "streakValue"
    FROM "userActivity"
  ),
  "streakGroups" AS (
    SELECT
      "activityDate",
      SUM(CASE WHEN "activityDate" = "previousDate" + INTERVAL '1 day' THEN 0 ELSE 1 END)
      OVER (ORDER BY "activityDate") AS "streakGroup",
      "streakValue"
    FROM "consecutiveDays"
  )
  SELECT
    MIN("activityDate") AS "streakStartDate",
    MAX("activityDate") AS "streakEndDate",
    SUM("streakValue") AS "streakLength"
  FROM "streakGroups"
  GROUP BY "streakGroup"
  HAVING MAX("activityDate") IN (CURRENT_DATE, CURRENT_DATE - INTERVAL '1 day')
  ORDER BY MAX("activityDate") DESC
  LIMIT 1
  `;

  return streaks?.[0] ?? null;
}
