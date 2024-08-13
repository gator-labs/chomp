import { redirect } from "next/navigation";
import { getJwtPayload } from "../actions/jwt";
import { MINIMAL_ANSWER_COUNT } from "../constants/answers";
import prisma from "../services/prisma";

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
		LEFT JOIN public."Campaign" c ON c.id = d."campaignId"
		WHERE d."revealAtDate" IS NOT NULL 
		GROUP BY d.deck, d.id, c.image, d."revealAtDate"
		ORDER BY d."revealAtDate" DESC
		`;

  console.log(decksHistory);

  return decksHistory;
}

export async function getQuestionsHistoryQuery(
  userId: string,
  pageSize: number,
  currentPage: number,
): Promise<QuestionHistory[]> {
  const offset = (currentPage - 1) * pageSize;

  const baseQuery = `
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
    public."QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
  LEFT JOIN 
    public."ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
  FULL JOIN public."Campaign" c on c.id = q."campaignId"
  WHERE 
    q."revealAtDate" IS NOT NULL
  GROUP BY 
    q.id, cr."rewardTokenAmount", cr."burnTransactionSignature", c."image"
`;

  const havingClause = `
  HAVING 
    (
      SELECT COUNT(distinct concat(qa."userId", qo."questionId"))
      FROM public."QuestionOption" qo
      JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
      WHERE qo."questionId" = q."id"
    ) >= 20
`;

  const endQuery = `
  ORDER BY q."revealAtDate" DESC, q."id"
  LIMIT ${pageSize} OFFSET ${offset}
`;

  let finalQuery = baseQuery;
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === "staging") {
    finalQuery += havingClause;
  }
  finalQuery += endQuery;

  const historyResult: QuestionHistory[] =
    await prisma.$queryRawUnsafe(finalQuery);

  return historyResult.map((hr) => ({
    ...hr,
    claimedAmount: Math.trunc(Number(hr.claimedAmount)),
    revealTokenAmount: Number(hr.revealTokenAmount),
  }));
}

export async function getAllQuestionsReadyForReveal(): Promise<
  { id: number; revealTokenAmount: number }[]
> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const userId = payload.sub;

  const questions = await prisma.$queryRawUnsafe<
    { id: number; revealTokenAmount: number; answerCount: number }[]
  >(
    `
		SELECT 
    q.id,
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
    "ChompResult" cr ON cr."questionId" = q.id
    AND cr."userId" = '${userId}'
    AND cr."transactionStatus" IN ('Completed', 'Pending')
JOIN 
    "QuestionOption" qo ON q.id = qo."questionId"
JOIN 
    "QuestionAnswer" qa ON qo.id = qa."questionOptionId"
WHERE 
    (cr."transactionStatus" IS NULL OR cr."transactionStatus" != 'Completed')
    AND q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND qa.selected = TRUE
    AND qa."userId" = '${userId}';
	`,
  );

  return questions.filter(
    (question) =>
      question.answerCount && question.answerCount >= MINIMAL_ANSWER_COUNT,
  );
}
