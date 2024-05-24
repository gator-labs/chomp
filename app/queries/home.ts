"use server";

import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import { redirect } from "next/navigation";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

const duration = require("dayjs/plugin/duration");
dayjs.extend(duration);

type UserStatistics = {
  cardsChomped: string;
  averageTimeToAnswer: string;
  daysStreak: string;
  totalPointsEarned: string;
};

type UserStatisticsQueryResult = {
  cardsChomped?: number;
  averageTimeToAnswer?: Decimal;
  daysStreak?: number;
  totalPointsEarned?: Decimal;
};

export async function getUserStatistics(): Promise<UserStatistics> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const stats = await queryUserStatistics(payload.sub);

  return stats;
}

async function queryUserStatistics(userId: string): Promise<UserStatistics> {
  const questionOptionPercentagesQueryResult: UserStatisticsQueryResult[] =
    await prisma.$queryRaw`
  select 
    (
      (
        select 
          count(distinct q."id")
        from public."Question" q
        join public."QuestionOption" qo on qo."questionId" = q."id"
        join public."QuestionAnswer" qa on (qa."questionOptionId" = qo."id" and qa."hasViewedButNotSubmitted" = false)
        left join public."DeckQuestion" dq on dq."questionId" = q."id"
        where dq is null and qa."userId" = u."id"
        limit 1
      )
      +
      (
        select
          count(distinct d."id") 
        from public."Deck" d
        join public."DeckQuestion" dq on dq."deckId" = d."id"
        join public."Question" q on q."id" = dq."questionId"
        join public."QuestionOption" qo on qo."questionId" = q."id"
        join public."QuestionAnswer" qa on (qa."questionOptionId" = qo."id" and qa."hasViewedButNotSubmitted" = false)
        where qa."userId" = u."id"
        limit 1
      )
    ) as "cardsChomped",
    (
      select avg(qa."timeToAnswer") from public."QuestionAnswer" qa 
      where qa."userId" = u."id" and qa."timeToAnswer" is not null
      limit 1
    ) as "averageTimeToAnswer",
    (
      select
        date_part('day', s."lastDayOfStreak" - s."streakStartedAt") + 1
      from public."Streak" s
      where s."userId" = u."id"
      order by date_part('day', s."lastDayOfStreak" - s."streakStartedAt") desc
      limit 1
    ) as "daysStreak",
    (
      select
        fab."amount"
      from public."FungibleAssetBalance" fab
      where fab."userId" = u."id" and fab."asset" = 'Point'
      limit 1
    ) as "totalPointsEarned"
  from public."User" u
  where u."id" = ${userId}
  limit 1`;

  const result = questionOptionPercentagesQueryResult[0];

  return {
    averageTimeToAnswer: result.averageTimeToAnswer
      ? dayjs
          .duration(result.averageTimeToAnswer.toNumber(), "milliseconds")
          .format("m:ss")
      : "-",
    cardsChomped: result.cardsChomped ? result.cardsChomped.toString() : "0",
    daysStreak: result.daysStreak ? result.daysStreak.toString() : "0",
    totalPointsEarned: result.totalPointsEarned
      ? result.totalPointsEarned.toString()
      : "0",
  };
}
