import { DeckHistoryItem } from "@/types/history";
import { QuestionCardIndicatorType } from "@/types/question";

import prisma from "../services/prisma";
import { authGuard } from "../utils/auth";
import { filterQuestionsByMinimalNumberOfAnswers } from "../utils/question";

export type HistoryResult = {
  id: number;
  image: string | null;
  revealAtDate: Date | null;
  deck: string;
  numberOfQuestionsInDeck: number;
  answeredQuestions: number;
  claimedQuestions: number;
  revealedQuestions: number;
  claimableQuestions: number;
  claimedAmount: number | null;
};

export type QuestionHistory = {
  id: number;
  question: string;
  revealAtDate: Date;
  isAnswered: boolean;
  isClaimed: boolean;
  isRevealed: boolean;
  isClaimable: boolean;
  isRevealable: boolean;
  claimedAmount?: number;
  revealTokenAmount: number;
  burnTransactionSignature?: string;
  answerCount: number;
  image?: string;
};

export type NewQuestionHistory = {
  id: number;
  question: string;
  deckTitle: string;
  indicatorType: QuestionCardIndicatorType;
  revealAtDate: Date | null;
};

export type NewQuestionHistoryData = {
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  unrevealedCount: number;
};

export type QuestionHistoryFilter = "isRevealable" | "all";

export async function getDecksHistory(
  userId: string,
): Promise<HistoryResult[]> {
  const decksHistory: HistoryResult[] = await prisma.$queryRaw`
		SELECT 
			d.id,
			c.image,
			d."revealAtDate",
			d.deck, 
			COUNT(DISTINCT dq."questionId") AS "numberOfQuestionsInDeck", 
			COUNT(DISTINCT CASE WHEN qa.selected = true THEN qa."questionOptionId" END) AS "answeredQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Claimed'::public."ResultType" AND cr."rewardTokenAmount" > 0 THEN cr."questionId" END) AS "claimedQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Revealed'::public."ResultType" OR cr."result" = 'Claimed'::public."ResultType" THEN cr."questionId" END) AS "revealedQuestions",
			COUNT(DISTINCT CASE WHEN cr."result" = 'Revealed'::public."ResultType" AND cr."rewardTokenAmount" > 0 THEN cr."questionId" END) AS "claimableQuestions",
			SUM(CASE WHEN cr."result" = 'Claimed'::public."ResultType" THEN cr."rewardTokenAmount" END) AS "claimedAmount"
		FROM public."DeckQuestion" dq 
		JOIN public."Deck" d ON d.id = dq."deckId" 
		JOIN public."Question" q ON q.id = dq."questionId"
		JOIN public."QuestionOption" qo ON qo."questionId" = q.id
		LEFT JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
		LEFT JOIN public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
		LEFT JOIN public."Stack" c ON c.id = d."stackId"
		WHERE d."revealAtDate" IS NOT NULL 
		GROUP BY d.deck, d.id, c.image, d."revealAtDate"
		ORDER BY d."revealAtDate" DESC
		`;

  return decksHistory;
}

export async function getQuestionsHistoryQuery(
  userId: string,
  pageSize: number,
  currentPage: number,
  deckId?: number,
  filter: QuestionHistoryFilter = "all",
): Promise<QuestionHistory[]> {
  const offset = (currentPage - 1) * pageSize;

  const getAllDecks = !deckId;

  const historyResult: QuestionHistory[] = await prisma.$queryRaw`
  SELECT * FROM (
      SELECT
        q.id,
        q.question,
        q."revealAtDate",
        cr."rewardTokenAmount" as "claimedAmount",
        cr."burnTransactionSignature",
        c."image",
        q."revealTokenAmount",
        CASE
          WHEN COUNT(CASE WHEN qa.selected = true THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isAnswered",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isClaimed",
        CASE
          WHEN COUNT(CASE WHEN (cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0) OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) > 0 THEN true
          ELSE false
        END AS "isRevealed",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Revealed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0
              AND COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) = 0 THEN true
          ELSE false
        END AS "isClaimable",
        CASE
          WHEN COUNT(CASE WHEN cr.result = 'Claimed' OR (cr.result = 'Revealed' AND cr."transactionStatus" = 'Completed') THEN 1 ELSE NULL END) = 0
              AND q."revealAtDate" < NOW() THEN true
          ELSE false
        END AS "isRevealable"
      FROM
        public."Question" q
      JOIN
        public."QuestionOption" qo ON qo."questionId" = q.id
      LEFT JOIN
        public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = ${userId}
      LEFT JOIN
        public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = ${userId} AND cr."questionId" IS NOT NULL
      FULL JOIN public."Stack" c on c.id = q."stackId"
      JOIN public."DeckQuestion" dq ON dq."questionId" = q.id
      WHERE
        q."revealAtDate" IS NOT NULL AND (${getAllDecks} IS TRUE OR dq."deckId" = ${deckId})
      GROUP BY
        q.id, cr."rewardTokenAmount", cr."burnTransactionSignature", c."image"
      HAVING
        (
          SELECT COUNT(distinct concat(qa."userId", qo."questionId"))
          FROM public."QuestionOption" qo
          JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
          WHERE qo."questionId" = q."id"
        ) >= ${Number(process.env.MINIMAL_ANSWERS_PER_QUESTION ?? 3)}
      ORDER BY q."revealAtDate" DESC, q."id"
  ) WHERE (
      ${filter} = 'all' OR (${filter} = 'isRevealable' AND "isRevealable" IS true)
  )
  LIMIT ${pageSize} OFFSET ${offset}
`;

  return historyResult.map((hr) => ({
    ...hr,
    claimedAmount: Math.trunc(Number(hr.claimedAmount)),
    revealTokenAmount: Number(hr.revealTokenAmount),
  }));
}

export async function getAllQuestionsReadyForReveal(): Promise<
  { id: number; revealTokenAmount: number; question: string }[]
> {
  const payload = await authGuard();

  const userId = payload.sub;

  const questions = await prisma.$queryRaw<
    {
      id: number;
      revealTokenAmount: number;
      answerCount: number;
      question: string;
    }[]
  >`
		SELECT 
    q.id,
    q.question,
    CASE 
        WHEN cr."transactionStatus" = 'Completed' OR cr."transactionStatus" = 'Pending' THEN 0
        ELSE q."revealTokenAmount"
    END AS "revealTokenAmount",
    (
        SELECT
            COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM 
            public."QuestionOption" qo
        JOIN 
            public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE 
            qo."questionId" = q."id"
    ) AS "answerCount"
FROM 
    public."Question" q
LEFT JOIN 
    public."ChompResult" cr ON cr."questionId" = q.id
    AND cr."userId" = ${userId}
    AND cr."transactionStatus" IN ('Completed', 'Pending')
JOIN 
    public."QuestionOption" qo ON q.id = qo."questionId"
JOIN 
    public."QuestionAnswer" qa ON qo.id = qa."questionOptionId"
WHERE 
    (cr."transactionStatus" IS NULL OR cr."transactionStatus" != 'Completed')
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND qa.selected = TRUE
    AND qa."userId" = ${userId};
	`;

  return filterQuestionsByMinimalNumberOfAnswers(questions);
}

export async function getNewHistoryQuery(
  userId: string,
  pageSize: number,
  currentPage: number,
  deckId?: number,
): Promise<NewQuestionHistory[]> {
  const offset = (currentPage - 1) * pageSize;

  const getAllDecks = !deckId;

  const result: NewQuestionHistory[] = await prisma.$queryRaw`
    SELECT
    q.id       AS "id",
    d.deck     AS "deckTitle",
    q.question AS "question",
    q."revealAtDate" AS "revealAtDate",
    CASE
        WHEN COUNT(CASE WHEN qa.selected IS NOT NULL THEN 1 ELSE NULL END) = 0 THEN 'unanswered'
        WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" = true AND qa."selected" = true THEN 1 ELSE NULL END) > 0 THEN 'correct'
        WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" != qa."selected" THEN 1 ELSE NULL END) > 0 THEN 'incorrect'
    END AS "indicatorType"
FROM "Question" q
         JOIN
     public."QuestionOption" qo ON qo."questionId" = q.id
         LEFT JOIN
     public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = ${userId} AND qa.selected IS TRUE
         LEFT JOIN
     public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = ${userId} AND cr."questionId" IS NOT NULL
         JOIN public."DeckQuestion" dq ON dq."questionId" = q.id
         JOIN public."Deck" d ON d.id = dq."deckId" AND (${getAllDecks} IS TRUE OR dq."deckId" = ${deckId})
WHERE q."revealAtDate" IS NOT NULL AND q."revealAtDate" <= NOW()
GROUP BY q.id, d.id, d.deck, q.question, q."revealAtDate"
ORDER BY q.id DESC
    LIMIT ${pageSize} OFFSET ${offset}
  `;

  return result;
}

export async function getHistoryHeadersData(
  userId: string,
  deckId?: number,
): Promise<NewQuestionHistoryData> {
  const getAllDecks = !deckId;

  const result: { count: number; indicatorType: string }[] =
    await prisma.$queryRaw`
    SELECT COUNT(*) AS "count", sub.questionStatus AS "indicatorType" FROM (
   SELECT
    q.id AS "questionId",
    d.id AS "deckId",
    d.deck,
    q.question,
    q."revealAtDate",
    CASE
        WHEN COUNT(CASE WHEN qa.selected IS NOT NULL THEN 1 ELSE NULL END) = 0 THEN 'unanswered'
        WHEN COUNT(CASE WHEN q."revealAtDate" > NOW() THEN 1 ELSE NULL END) > 0 THEN 'unrevealed'
        WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" = true AND qa."selected" = true THEN 1 ELSE NULL END) > 0 THEN 'correct'
        WHEN COUNT(CASE WHEN q."revealAtDate" <= NOW() AND qo.id = qa."questionOptionId" AND qo."calculatedIsCorrect" != qa."selected" THEN 1 ELSE NULL END) > 0 THEN 'incorrect'
    END AS questionStatus
FROM "Question" q
         JOIN
     public."QuestionOption" qo ON qo."questionId" = q.id
         LEFT JOIN
     public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = ${userId} AND qa.selected IS TRUE
         LEFT JOIN
     public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = ${userId} AND cr."questionId" IS NOT NULL
         JOIN public."DeckQuestion" dq ON dq."questionId" = q.id
         JOIN public."Deck" d ON d.id = dq."deckId" AND (${getAllDecks} IS TRUE OR dq."deckId" = ${deckId})
WHERE q."revealAtDate" IS NOT NULL
GROUP BY q.id, d.id, d.deck, q.question, q."revealAtDate"
ORDER BY q.id DESC
              ) AS sub
GROUP BY sub.questionStatus
`;

  const transformedResult: {
    [key: string]: number;
  } = result.reduce<Record<string, number>>((acc, { count, indicatorType }) => {
    if (!acc[indicatorType]) {
      acc[indicatorType] = 0;
    }

    acc[indicatorType] += Number(count);

    return acc;
  }, {});

  return {
    correctCount: transformedResult.correct || 0,
    incorrectCount: transformedResult.incorrect || 0,
    unansweredCount: transformedResult.unanswered || 0,
    unrevealedCount: transformedResult.unrevealed || 0,
  };
}

export async function getAllDeckQuestionsReadyForReveal(
  deckId: number,
): Promise<{ id: number; revealTokenAmount: number; question: string }[]> {
  const payload = await authGuard();

  const userId = payload.sub;

  const questions = await prisma.$queryRaw<
    {
      id: number;
      revealTokenAmount: number;
      answerCount: number;
      question: string;
    }[]
  >`
		SELECT 
    q.id,
    q.question,
    CASE 
        WHEN cr."transactionStatus" = 'Completed' OR cr."transactionStatus" = 'Pending' THEN 0
        ELSE q."revealTokenAmount"
    END AS "revealTokenAmount",
    (
        SELECT
            COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM 
            public."QuestionOption" qo
        JOIN 
            public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE 
            qo."questionId" = q."id"
    ) AS "answerCount",
     dc."deckId" as "deckId"
FROM 
    public."Question" q
LEFT JOIN 
    "ChompResult" cr ON cr."questionId" = q.id
    AND cr."userId" = ${userId}
    AND cr."transactionStatus" IN ('Completed', 'Pending')
JOIN 
    "QuestionOption" qo ON q.id = qo."questionId"
JOIN 
    "QuestionAnswer" qa ON qo.id = qa."questionOptionId"
JOIN "DeckQuestion" dc ON q.id = dc."questionId"
WHERE 
    (cr."transactionStatus" IS NULL OR cr."transactionStatus" != 'Completed')
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND qa.selected = TRUE
    AND qa."userId" = ${userId}
    AND dc."deckId" = ${deckId};
	`;

  return filterQuestionsByMinimalNumberOfAnswers(questions);
}

export async function getAnsweredDecksForHistory(
  userId: string,
  pageSize: number,
  currentPage: number,
): Promise<DeckHistoryItem[]> {
  const offset = (currentPage - 1) * pageSize;

  const result: DeckHistoryItem[] = await prisma.$queryRaw`
  WITH history_deck_cte AS (
    SELECT 
      d.id,
      d.deck,
      d."imageUrl",
      d."revealAtDate",
      COALESCE(SUM(CAST(dr."bonkReward" AS NUMERIC)), 0) AS "total_reward_amount",
      COALESCE((SELECT SUM(q."revealTokenAmount") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q 
       ON dq."questionId" = q.id
       WHERE dq."deckId" = d.id), 0) AS "total_potential_reward_amount",
      COALESCE((SELECT SUM(q."creditCostPerQuestion") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q 
       ON dq."questionId" = q.id
       WHERE dq."deckId" = d.id), 0) AS "total_credit_cost",
      (SELECT COUNT(DISTINCT q."id") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q ON dq."questionId" = q.id
       JOIN public."QuestionOption" qo ON qo."questionId" = q.id
       JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
       WHERE dq."deckId" = d.id
       AND qa."userId" = ${userId}) AS "answeredQuestions",
      (SELECT COUNT(DISTINCT dq."questionId")
       FROM public."DeckQuestion" dq
       WHERE dq."deckId" = d.id) AS "totalQuestions"
    FROM 
      public."Deck" d
    LEFT JOIN "DeckRewards" dr ON dr."userId" = ${userId} AND dr."deckId" = d.id
    WHERE 
      d."revealAtDate" IS NOT NULL
      AND d."revealAtDate" <= NOW()
      AND EXISTS (
        SELECT 1
        FROM public."DeckQuestion" dq
        JOIN public."Question" q ON dq."questionId" = q.id
        JOIN public."QuestionOption" qo ON qo."questionId" = q.id
        JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
        WHERE dq."deckId" = d.id
        AND qa."userId" = ${userId}
      )
    GROUP BY 
      d.id, d.deck, d."imageUrl", d."revealAtDate"  
  ),
  total_count AS (
    SELECT COUNT(*) AS count FROM history_deck_cte
  )
  SELECT
    history_deck_cte.*,
    total_count.count AS total_count
  FROM
    history_deck_cte, total_count
  ORDER BY 
    history_deck_cte."revealAtDate" DESC,
    history_deck_cte.id DESC
  LIMIT ${pageSize} OFFSET ${offset}
  `;

  return result;
}

export async function getDecksForHistory(
  userId: string,
  pageSize: number,
  currentPage: number,
): Promise<DeckHistoryItem[]> {
  const offset = (currentPage - 1) * pageSize;

  const result: DeckHistoryItem[] = await prisma.$queryRaw`
  WITH history_deck_cte AS (
    SELECT 
      d.id,
      d.deck,
      d."imageUrl",
      d."revealAtDate",
      COALESCE(SUM(CAST(dr."bonkReward" AS NUMERIC)), 0) AS "total_reward_amount",
      COALESCE((SELECT SUM(q."revealTokenAmount") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q 
       ON dq."questionId" = q.id
       WHERE dq."deckId" = d.id), 0) AS "total_potential_reward_amount",
      COALESCE((SELECT SUM(q."creditCostPerQuestion") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q 
       ON dq."questionId" = q.id
       WHERE dq."deckId" = d.id), 0) AS "total_credit_cost",
      (SELECT COUNT(DISTINCT q."id") 
       FROM public."DeckQuestion" dq
       JOIN public."Question" q ON dq."questionId" = q.id
       JOIN public."QuestionOption" qo ON qo."questionId" = q.id
       JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id
       WHERE dq."deckId" = d.id
       AND qa."userId" = ${userId}) AS "answeredQuestions",
      (SELECT COUNT(DISTINCT dq."questionId")
       FROM public."DeckQuestion" dq
       WHERE dq."deckId" = d.id) AS "totalQuestions"
    FROM 
      public."Deck" d
    LEFT JOIN "DeckRewards" dr ON dr."userId" = ${userId} AND dr."deckId" = d.id
    WHERE 
      d."revealAtDate" IS NOT NULL
      AND d."revealAtDate" <= NOW()
    GROUP BY 
      d.id, d.deck, d."imageUrl", d."revealAtDate"
  ),
  total_count AS (
    SELECT COUNT(*) AS count FROM history_deck_cte
  )
  SELECT
    history_deck_cte.*,
    total_count.count AS total_count
  FROM
    history_deck_cte, total_count
  ORDER BY 
    history_deck_cte."revealAtDate" DESC,
    history_deck_cte.id DESC -- Added secondary sort
  LIMIT ${pageSize} OFFSET ${offset}
  `;

  return result;
}
