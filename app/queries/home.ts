"use server";

import { AnswerStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import dayjs from "dayjs";
import { redirect } from "next/navigation";
import { getJwtPayload } from "../actions/jwt";
import { MINIMAL_ANSWER_COUNT } from "../constants/answers";
import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";

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
  image?: string;
};

export type DeckExpiringSoon = {
  id: number;
  deck: string;
  revealAtDate?: Date;
  date?: Date;
  campaignId: number;
  answerCount?: number;
  revealAtAnswerCount?: number;
  image?: string;
};

export type QuestionsForReveal = {
  id: number;
  question: string;
  revealAtDate?: Date;
  answerCount?: number;
  revealAtAnswerCount?: number;
  revealTokenAmount?: number;
  image?: string;
};

export async function getDecksForExpiringSection(): Promise<
  DeckExpiringSoon[]
> {
  const payload = await authGuard();

  const decks = await queryExpiringDecks(payload.sub);

  return decks;
}
export async function getDailyDecksForExpiringSection(): Promise<
  DeckExpiringSoon[]
> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const decks = await queryExpiringDailyDecks(payload.sub);

  return decks;
}

export async function getNextDeckId(
  deckId: number,
  campaignId: number | null,
): Promise<number | undefined> {
  const payload = await authGuard();

  const nextDeckId = await getNextDeckIdQuery(payload.sub, deckId, campaignId);

  return nextDeckId;
}

async function getNextDeckIdQuery(
  userId: string,
  deckId: number,
  campaignId: number | null,
): Promise<number | undefined> {
  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
    select
    d."id",
    d."deck",
    d."revealAtDate",
    d."revealAtAnswerCount",
    d."campaignId",
    c."image"
    from public."Deck" d
    full join "Campaign" c on c."id" = d."campaignId"
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
          d."activeFromDate" <= now()
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
  `;

  const filteredDecks = deckExpiringSoon.filter((deck) => deck.id !== deckId);

  const campaignMatch = filteredDecks.find(
    (deck) => deck.campaignId === campaignId,
  );

  if (campaignMatch) {
    return campaignMatch.id;
  }

  return filteredDecks.length > 0 ? filteredDecks[0].id : undefined;
}

async function queryExpiringDecks(userId: string): Promise<DeckExpiringSoon[]> {
  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
  SELECT
    d."id",
    d."deck",
    d."revealAtDate",
    c."image"
FROM
    public."Deck" d
FULL JOIN
    "Campaign" c ON c."id" = d."campaignId"
WHERE
    d."revealAtDate" > NOW() 
    AND d."date" IS NULL 
    AND d."activeFromDate" <= NOW()
    AND EXISTS (
        SELECT 1
        FROM public."DeckQuestion" dq
        JOIN public."Question" q ON dq."questionId" = q."id"
        LEFT JOIN public."QuestionOption" qo ON qo."questionId" = q."id"
        LEFT JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id" 
        AND qa."userId" = ${userId}
        WHERE dq."deckId" = d."id"
        GROUP BY dq."deckId"
        HAVING COUNT(DISTINCT qo."id") > COUNT(qa."id")
    );
  `;

  return deckExpiringSoon;
}

async function queryExpiringDailyDecks(
  userId: string,
): Promise<DeckExpiringSoon[]> {
  const currentDayStart = dayjs(new Date()).startOf("day").toDate();
  const currentDayEnd = dayjs(new Date()).endOf("day").toDate();

  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
  SELECT
    d."id",
    d."deck",
    d."revealAtDate",
    d."date",
    c."image"
FROM
    public."Deck" d
FULL JOIN
    "Campaign" c ON c."id" = d."campaignId"
WHERE
    d."activeFromDate" IS NULL
    AND d."date" >= ${currentDayStart}
    AND d."date" <= ${currentDayEnd}
    AND EXISTS (
        SELECT 1
        FROM public."DeckQuestion" dq
        JOIN public."Question" q ON dq."questionId" = q."id"
        LEFT JOIN public."QuestionOption" qo ON qo."questionId" = q."id"
        LEFT JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        AND qa."userId" = ${userId}
        AND qa."id" > 0
        WHERE dq."deckId" = d."id"
        GROUP BY dq."deckId"
        HAVING COUNT(DISTINCT qa."id") < COUNT(DISTINCT qo."id")
    );
  `;
  return deckExpiringSoon;
}

export async function getQuestionsForRevealedSection(): Promise<
  RevealedQuestion[]
> {
  const payload = await authGuard();

  const questions = await queryRevealedQuestions(payload.sub);

  return questions;
}

async function queryRevealedQuestions(
  userId: string,
): Promise<RevealedQuestion[]> {
  const revealQuestions: RevealedQuestion[] = await prisma.$queryRaw`
  SELECT DISTINCT
    q."id",
    q."question",
    q."revealAtDate",
    q."revealAtAnswerCount",
    q."revealTokenAmount",
    c."image"
  FROM public."Question" q
  LEFT JOIN "Campaign" c ON c."id" = q."campaignId"
  LEFT JOIN public."ChompResult" cr1 
      ON cr1."questionId" = q."id" 
      AND cr1."userId" = ${userId} 
      AND cr1."transactionStatus" = 'Completed'
  LEFT JOIN public."DeckQuestion" dq 
      ON dq."questionId" = q."id"
  LEFT JOIN public."QuestionOption" qo 
      ON qo."questionId" = q."id"
  LEFT JOIN public."QuestionAnswer" qa 
      ON qa."questionOptionId" = qo."id" 
      AND qa."userId" = ${userId} AND qa."status" = ${AnswerStatus.Submitted}
  WHERE
      cr1."questionId" IS NULL
      AND qa."id" IS NULL
      AND q."revealAtDate" IS NOT NULL 
      AND q."revealAtDate" < now() 
  ORDER BY q."revealAtDate" DESC
  LIMIT 5
  `;

  return revealQuestions;
}

export async function getQuestionsForReadyToRevealSection(): Promise<
  QuestionsForReveal[]
> {
  const payload = await authGuard();

  const questions = await queryQuestionsForReadyToReveal(payload.sub);

  return questions.filter(
    (question) =>
      question.answerCount && question.answerCount >= MINIMAL_ANSWER_COUNT,
  );
}

async function queryQuestionsForReadyToReveal(
  userId: string,
): Promise<QuestionsForReveal[]> {
  const revealQuestions: QuestionsForReveal[] = await prisma.$queryRaw`
  SELECT
  q."id",
  q."question",
  q."revealAtDate",
  (
  		SELECT
          	COUNT(DISTINCT CONCAT(qa."userId",qo."questionId"))
	    FROM public."QuestionOption" qo
	    JOIN public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
	    WHERE qo."questionId" = q."id"
  	) as "answerCount",
  q."revealTokenAmount"
  FROM public."Question" q
  LEFT JOIN "ChompResult" cr on cr."questionId" = q.id
  AND cr."userId" = ${userId}
  AND cr."transactionStatus" = 'Completed'
  JOIN "QuestionOption" qo ON q.id = qo."questionId"
  JOIN "QuestionAnswer" qa ON qo.id = qa."questionOptionId"
  WHERE
  cr."questionId" is null
  AND
  q."revealAtDate" is not null
  AND
  q."revealAtDate" < now()
  AND
  qa.selected = true AND qa."userId" = ${userId}
  ORDER BY  q."createdAt" DESC
  `;

  return revealQuestions;
}

export async function getUserStatistics(): Promise<UserStatistics> {
  const payload = await authGuard();

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
      where qa.selected = true and qa."status" = 'Submitted' and qa."userId" = u."id"
    ) as "cardsChomped",
    (
      select avg(qa."timeToAnswer") from public."QuestionAnswer" qa 
      where qa."userId" = u."id" and qa."timeToAnswer" is not null
      limit 1
    ) as "averageTimeToAnswer",
    (
      select s."count"
      from public."Streak" s
      where s."userId" = u."id"
      order by s."count" desc
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
