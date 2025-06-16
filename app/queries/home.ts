"use server";

import { getCreditBalance } from "@/lib/credits/getCreditBalance";
import { calculateTotalPrizeTokens } from "@/lib/mysteryBox";
import { getPointBalance } from "@/lib/points/getPointBalance";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

import { getJwtPayload } from "../actions/jwt";
import { DECK_LIMIT } from "../constants/decks";
import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";
import { getStartAndEndOfDay } from "../utils/date";

dayjs.extend(duration);

export type Streak = {
  streakStartDate: Date;
  streakEndDate: Date;
  streakLength: number;
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
  creditCostPerQuestion: number;
  date?: Date;
  stackId: number;
  answerCount?: number;
  revealAtAnswerCount?: number;
  image?: string;
  total_count?: number;
  total_credit_cost?: number;
  total_reward_amount?: number;
  total_questions?: number;
  answered_questions?: number;
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

export async function getNextDeckId(
  deckId: number,
  stackId: number | null,
): Promise<number | undefined> {
  const payload = await authGuard();

  const nextDeckId = await getNextDeckIdQuery(payload.sub, deckId, stackId);

  return nextDeckId;
}

async function getNextDeckIdQuery(
  userId: string,
  deckId: number,
  stackId: number | null,
): Promise<number | undefined> {
  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
    select
    d."id",
    d."deck",
    d."revealAtDate",
    d."revealAtAnswerCount",
    d."stackId",
    d."creditCostPerQuestion",
    c."image"
    from public."Deck" d
    full join public."Stack" c on c."id" = d."stackId"
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
          c."hideDeckFromHomepage" IS NULL OR c."hideDeckFromHomepage" IS FALSE
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

  const previousDeck = deckExpiringSoon.filter((deck) => deck.id === deckId)[0];

  // If no previous deck is found, return the first available deck
  if (!previousDeck) {
    return deckExpiringSoon.length > 0 ? deckExpiringSoon[0].id : undefined;
  }

  // Remove previous deck from the deck list
  const filteredDecks = deckExpiringSoon.filter((deck) => deck.id !== deckId);

  /* Sort decks based on credit cost:
   * If previous deck was paid, sort from highest to lowest cost
   * If previous deck was free, sort from lowest to highest cost
   * */
  const sortedDecks = filteredDecks.sort((a, b) => {
    const costDifference = b.creditCostPerQuestion - a.creditCostPerQuestion;
    return previousDeck.creditCostPerQuestion > 0
      ? costDifference
      : -costDifference;
  });

  const stackMatch = filteredDecks.find((deck) => deck.stackId === stackId);

  if (stackMatch) {
    return stackMatch.id;
  }

  return sortedDecks.length > 0 ? sortedDecks[0].id : undefined;
}

/**
 * returns decks that
 *  revealAtDate has not yet passed (not expired)
 *  and activeFromDate already have passed (are active) or has no activeFromDate date
 *  and date is in current day
 *  and have unaswered questions for this user (so the user can finish them if incomplete)
 *
 *  the current day is based on UTC
 */
export async function queryExpiringDecks(
  userId: string,
): Promise<DeckExpiringSoon[]> {
  const { startOfTheDay, endOfTheDay } = getStartAndEndOfDay(new Date());

  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
  SELECT
    d."id",
    d."deck",
    d."date",
    d."revealAtDate",
    c."image"
  FROM
      public."Deck" d
  FULL JOIN
      public."Stack" c ON c."id" = d."stackId"
  WHERE
      d."revealAtDate" > NOW() -- Reveal date is in the future

      AND (
        d."activeFromDate" <= NOW() -- Deck is active
        OR (
          d."activeFromDate" IS NULL -- Or has no activeFromDate 
          AND d."date" >= ${startOfTheDay} -- Date is within the "today" range
          AND d."date" <= ${endOfTheDay}
        )
      )
  
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
      ) -- There is unaswered questions for this deck

      ORDER BY
      d."date" ASC,
      d."revealAtDate" ASC
  `;

  return deckExpiringSoon;
}

export async function getUsersLatestStreak(): Promise<number> {
  const payload = await authGuard();

  const longestStreak = await queryUsersLatestStreak(payload.sub);

  return longestStreak;
}

async function queryUsersLatestStreak(userId: string): Promise<number> {
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

  return Number(streaks?.[0]?.streakLength || 0);
}

export async function getUsersTotalClaimedAmount(): Promise<number> {
  const payload = await authGuard();

  const totalClaimedAmount = await queryUsersTotalClaimedAmount(payload.sub);

  return totalClaimedAmount;
}

async function queryUsersTotalClaimedAmount(userId: string): Promise<number> {
  const bonkAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

  const [{ questionTotalClaimedAmount }]: {
    questionTotalClaimedAmount: number;
  }[] = await prisma.$queryRaw`
  SELECT ROUND(SUM("rewardTokenAmount")) AS "questionTotalClaimedAmount"
  FROM public."ChompResult"
  WHERE "result" = 'Claimed' 
  AND "userId" = ${userId}
  `;

  const mysteryBoxTotalClaimedAmount = await calculateTotalPrizeTokens(
    userId,
    bonkAddress,
  );

  return (
    Number(questionTotalClaimedAmount) + Number(mysteryBoxTotalClaimedAmount)
  );
}

/**
 * Retrieves the total credit amount claimed by the user from mystery box prizes.
 *
 * @returns The total credit amount claimed by the user.
 */
export async function getUserTotalCreditAmount() {
  const payload = await getJwtPayload();
  const userId = payload?.sub;

  if (!userId) return 0;

  return await getCreditBalance(userId);
}

/**
 * Retrieves the total points amount gained by the user.
 *
 * @returns The total points amount claimed by the user.
 */
export async function getUserTotalPoints() {
  const payload = await getJwtPayload();
  const userId = payload?.sub;

  if (!userId) return 0;

  return await getPointBalance(userId);
}

// Get the decks with credit cost per question greater than 0 and revealAtDate greater than now
export async function getPremiumDecks({
  pageParam,
}: {
  pageParam: number;
}): Promise<DeckExpiringSoon[]> {
  const payload = await authGuard();

  const decks = await queryExpiringPremiumDecks(payload.sub, pageParam);

  return decks;
}

async function queryExpiringPremiumDecks(
  userId: string,
  currentPage: number,
): Promise<DeckExpiringSoon[]> {
  const currentDateTime = new Date();

  //skip the offset decks and get the next DECK_LIMIT decks
  const offset = (currentPage - 1) * DECK_LIMIT;

  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
WITH premium_deck_cte AS (
  SELECT
    d."id",
    d."deck",
    d."date",
    d."revealAtDate",
    c."image",
    (SELECT COUNT(DISTINCT dq."questionId")
     FROM public."DeckQuestion" dq
     WHERE dq."deckId" = d."id"
    ) as total_questions,
    (SELECT COUNT(DISTINCT q."id")
     FROM public."DeckQuestion" dq
     JOIN public."Question" q ON dq."questionId" = q."id"
     JOIN public."QuestionOption" qo ON qo."questionId" = q."id"
     JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
     WHERE dq."deckId" = d."id"
     AND qa."userId" = ${userId}
     AND qa."status" IN ('Submitted', 'Viewed')
    ) as answered_questions,
    (SELECT sum("creditCostPerQuestion") 
     FROM public."DeckQuestion" dq
     JOIN public."Question" q 
     ON dq."questionId" = q.id
     WHERE dq."deckId" = d."id"
    ) AS total_credit_cost,
    (SELECT sum("revealTokenAmount") 
     FROM public."DeckQuestion" dq
     JOIN public."Question" q 
     ON dq."questionId" = q.id
     WHERE dq."deckId" = d."id") AS total_reward_amount
FROM
    public."Deck" d
FULL JOIN
    public."Stack" c ON c."id" = d."stackId"
WHERE
    d."revealAtDate" > NOW() 
    AND (d."activeFromDate" <= NOW() OR  
    d."activeFromDate" IS NULL
    AND ${currentDateTime} >= d."date"
    AND ${currentDateTime}::timestamp <= d."date" + INTERVAL '24 hours')
    AND (c."hideDeckFromHomepage" = false OR c."hideDeckFromHomepage" IS NULL)
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
    )
    AND (
      SELECT sum("creditCostPerQuestion") FROM public."DeckQuestion" dq
      JOIN public."Question" q on dq."questionId" = q.id
      WHERE dq."deckId"= d."id"
    ) > 0)
    , total_count AS (
    SELECT COUNT(*) AS count FROM premium_deck_cte
)
SELECT 
    premium_deck_cte.*,
    total_count.count AS total_count
FROM premium_deck_cte, total_count
ORDER BY
    premium_deck_cte."date" ASC,
    premium_deck_cte."revealAtDate" ASC
LIMIT ${DECK_LIMIT} OFFSET ${offset};
  `;
  return deckExpiringSoon;
}

// Get the decks with credit cost per question equal to 0 and revealAtDate greater than now
export async function getFreeDecks({
  pageParam,
}: {
  pageParam: number;
}): Promise<DeckExpiringSoon[]> {
  const payload = await authGuard();

  const decks = await queryExpiringFreeDecks(payload.sub, pageParam);

  return decks;
}

async function queryExpiringFreeDecks(
  userId: string,
  currentPage: number,
): Promise<DeckExpiringSoon[]> {
  const offset = (currentPage - 1) * DECK_LIMIT;
  const currentDateTime = new Date();

  const deckExpiringSoon: DeckExpiringSoon[] = await prisma.$queryRaw`
  WITH free_deck_cte AS (
  SELECT
    d."id",
    d."deck",
    d."date",
    d."revealAtDate",
    c."image",
    0 as "total_credit_cost",
    (SELECT COUNT(DISTINCT dq."questionId")
     FROM public."DeckQuestion" dq
     WHERE dq."deckId" = d."id"
    ) as total_questions,
    (SELECT COUNT(DISTINCT q."id")
     FROM public."DeckQuestion" dq
     JOIN public."Question" q ON dq."questionId" = q."id"
     JOIN public."QuestionOption" qo ON qo."questionId" = q."id"
     JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
     WHERE dq."deckId" = d."id"
     AND qa."userId" = ${userId}
     AND qa."status" IN ('Submitted', 'Viewed')
    ) as answered_questions
FROM
    public."Deck" d
FULL JOIN
    public."Stack" c ON c."id" = d."stackId"
WHERE
    d."revealAtDate" > NOW() 
    AND (d."activeFromDate" <= NOW() OR  
    d."activeFromDate" IS NULL
    AND ${currentDateTime} >= d."date"
    AND ${currentDateTime}::timestamp <= d."date" + INTERVAL '24 hours')
    AND (c."hideDeckFromHomepage" = false OR c."hideDeckFromHomepage" IS NULL)
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
    )
    AND (
      SELECT sum("creditCostPerQuestion") FROM public."DeckQuestion" dq
      JOIN public."Question" q on dq."questionId" = q.id
      WHERE dq."deckId"= d."id"
    ) = 0)
    , total_count AS (
    SELECT COUNT(*) AS count FROM free_deck_cte
)
SELECT 
    free_deck_cte.*,
    total_count.count AS total_count
FROM free_deck_cte, total_count
ORDER BY
    free_deck_cte."date" ASC,
    free_deck_cte."revealAtDate" ASC
LIMIT ${DECK_LIMIT} OFFSET ${offset};
  `;
  return deckExpiringSoon;
}
