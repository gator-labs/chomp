"use server";

import { redirect } from "next/navigation";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

type UserStatistics = {
  cardsChomped?: number;
  averageTimeToAnswer?: string;
  daysStreak?: string;
  totalPointsEarned?: string;
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
  const questionOptionPercentages: UserStatistics[] = await prisma.$queryRaw`
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
    ) as cardsChomped,
    (
      select avg(qa."timeToAnswer") from public."QuestionAnswer" qa 
      where qa."userId" = u."id" and qa."timeToAnswer" is not null
      limit 1
    ) as averageTimeToAnswer,
    (
      select
        date_part('day', s."lastDayOfStreak" - s."streakStartedAt")
      from public."Streak" s
      where s."userId" = u."id"
      order by date_part('day', s."lastDayOfStreak" - s."streakStartedAt") desc
      limit 1
    ) as daysStreak,
    (
      select
        fab."amount"
      from public."FungibleAssetBalance" fab
      where fab."userId" = u."id" and fab."asset" = 'Point'
      limit 1
    ) as totalPointsEarned
  from public."User" u
  where u."id" = ${userId}
  limit 1`;

  return questionOptionPercentages[0];
}
