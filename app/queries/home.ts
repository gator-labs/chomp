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

export type RevealedQuestion = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  revealTokenAmount?: number;
};

export type DeckExpiringSoon = {
  id: number;
  deck: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  imageUrl?: string;
};

export type QuestionsForReveal = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  revealTokenAmount?: number;
};

export async function getDecksForExpiringSection(): Promise<
  DeckExpiringSoon[]
> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const decks = await queryExpiringDecks(payload.sub);

  return decks;
}

async function queryExpiringDecks(userId: string): Promise<DeckExpiringSoon[]> {
  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
  select
    d."id",
    d."deck",
    d."revealAtDate",
    (
        select
              count(distinct concat(dq."deckId", qa."userId"))
        from public."QuestionOption" qo
        join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
        join public."Question" q on qo."questionId" = q."id"
        join public."DeckQuestion" dq on dq."questionId" = q."id"
        where dq."deckId" = d."id"
      ) as "answerCount",
      d."revealAtAnswerCount",
      d."imageUrl"
  from public."Deck" d
  where
      (
        (
      		d."revealAtDate" > now() and d."revealAtDate" < now() + interval '3' day
  		  )
        and 
        (
      		d."date" is null
  		  )
        and 
        (
          d."revealAtAnswerCount" is null
          or
          d."revealAtAnswerCount" >
            (
              select
                count(distinct concat(dq."deckId", qa."userId"))
              from public."QuestionOption" qo
              join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
              join public."Question" q on qo."questionId" = q."id"
              join public."DeckQuestion" dq on dq."questionId" = q."id"
              where dq."deckId" = d."id"
            )
        )
      )
      and	
      d."id" not in
        (
          select
            dq."deckId"
          from public."QuestionOption" qo
            join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
            join public."Question" q on qo."questionId" = q."id"
            join public."DeckQuestion" dq on dq."questionId" = q."id"
            where dq."deckId" = d."id" and qa."userId" = ${userId}
        )
      and
      d."isActive" = true
  `;

  return deckExpiringSoon;
}

export async function getQuestionsForRevealedSection(): Promise<
  RevealedQuestion[]
> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const questions = await queryRevealedQuestions(payload.sub);

  return questions;
}

async function queryRevealedQuestions(
  userId: string,
): Promise<RevealedQuestion[]> {
  const revealQuestions: RevealedQuestion[] = await prisma.$queryRaw`
  select
  	q."id",
  	q."question",
  	q."revealAtDate",
  	(
  		select
          	count(distinct concat(qa."userId",qo."questionId"))
	    from public."QuestionOption" qo
	    join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
	    where qo."questionId" = q."id"
  	) as "answerCount",
  	q."revealAtAnswerCount",
  	q."revealTokenAmount"
  from public."Question" q 
  where
  	(
	    (
	      q."revealAtDate" is not null 
	      and 
	      q."revealAtDate" < now() 
	    )
	    or 
	    (
	      q."revealAtAnswerCount" is not null
	      and
	      q."revealAtAnswerCount" >=
	        (
	          select
	          	count(distinct concat(qa."userId",qo."questionId"))
	          from public."QuestionOption" qo
	          join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
	          where qo."questionId" = q."id"
	        )
	    )
    )
    and
    	(
    		q."id" not in
	    	(
	    		select
	    			cr."questionId"
	    		from public."ChompResult" cr
	    		where cr."questionId" = q."id" and cr."userId" = ${userId}
	    	)
	    	and
	    	q."id" not in
	    	(
	    		select
	    			dq."questionId"
	    		from public."DeckQuestion" dq
	    		join public."Deck" d on d."id" = dq."deckId"
	    		join public."ChompResult" cr on cr."deckId" = d."id"
	    		where cr."userId" = ${userId} and dq."questionId" = q."id"
	    	)
	    )
    and
    	q."id" not in
	    (
	    	select 
	    		qo."questionId"
	    	from public."QuestionOption" qo
          	join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
          	where qa."userId" = ${userId} and qo."questionId" = q."id"
	    )
  `;

  return revealQuestions;
}

export async function getQuestionsForReadyToRevealSection(): Promise<
  QuestionsForReveal[]
> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const questions = await queryQuestionsForReadyToReveal(payload.sub);

  return questions;
}

async function queryQuestionsForReadyToReveal(
  userId: string,
): Promise<QuestionsForReveal[]> {
  const revealQuestions: QuestionsForReveal[] = await prisma.$queryRaw`
  select
  	q."id",
  	q."question",
  	q."revealAtDate",
  	(
  		select
          	count(distinct concat(qa."userId",qo."questionId"))
	    from public."QuestionOption" qo
	    join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
	    where qo."questionId" = q."id"
  	) as "answerCount",
  	q."revealAtAnswerCount",
  	q."revealTokenAmount"
  from public."Question" q 
  where
  	(
	    (
	      q."revealAtDate" is not null 
	      and 
	      q."revealAtDate" < now() 
	    )
	    or 
	    (
	      q."revealAtAnswerCount" is not null
	      and
	      q."revealAtAnswerCount" >=
	        (
	          select
	          	count(distinct concat(qa."userId",qo."questionId"))
	          from public."QuestionOption" qo
	          join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
	          where qo."questionId" = q."id"
	        )
	    )
    )
    and
    	(
    		q."id" not in
	    	(
	    		select
	    			cr."questionId"
	    		from public."ChompResult" cr
	    		where cr."questionId" = q."id" and cr."userId" = ${userId}
	    	)
	    	and
	    	q."id" not in
	    	(
	    		select
	    			dq."questionId"
	    		from public."DeckQuestion" dq
	    		join public."Deck" d on d."id" = dq."deckId"
	    		join public."ChompResult" cr on cr."deckId" = d."id"
	    		where cr."userId" = ${userId} and dq."questionId" = q."id"
	    	)
	    )
    and
    	q."id" in
	    (
	    	select 
	    		qo."questionId"
	    	from public."QuestionOption" qo
          	join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
          	where qa."userId" = ${userId} and qo."questionId" = q."id"
	    )
  `;

  return revealQuestions;
}

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
      select count(distinct qo."questionId") from "QuestionAnswer" qa
      inner join "QuestionOption" qo ON qo.id = qa."questionOptionId" 
      where qa.selected = true and qa."hasViewedButNotSubmitted" = false and qa."userId" = u."id"
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
    averageTimeToAnswer: result?.averageTimeToAnswer
      ? dayjs
          .duration(result?.averageTimeToAnswer.toNumber(), "milliseconds")
          .format("m:ss")
      : "-",
    cardsChomped: result?.cardsChomped ? result?.cardsChomped.toString() : "0",
    daysStreak: result?.daysStreak ? result?.daysStreak.toString() : "0",
    totalPointsEarned: result?.totalPointsEarned
      ? result?.totalPointsEarned.toString()
      : "0",
  };
}
