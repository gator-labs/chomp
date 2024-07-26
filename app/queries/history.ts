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
};

export async function getDecksHistory(
  userId: string,
): Promise<HistoryResult[]> {
  const decksHistory: HistoryResult[] = await prisma.$queryRawUnsafe(
    `
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
		FROM "DeckQuestion" dq 
		JOIN "Deck" d ON d.id = dq."deckId" 
		JOIN "Question" q ON q.id = dq."questionId"
		JOIN "QuestionOption" qo ON qo."questionId" = q.id
		LEFT JOIN "QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
		LEFT JOIN "ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
		LEFT JOIN "Campaign" c ON c.id = d."campaignId"
		WHERE d."revealAtDate" IS NOT NULL 
		GROUP BY d.deck, d.id, c.image, d."revealAtDate"
		ORDER BY d."revealAtDate" DESC
		`,
  );

  console.log(decksHistory);

  return decksHistory;
}

export async function getQuestionsHistoryQuery(
  userId: string,
): Promise<QuestionHistory[]> {
  const historyResult: QuestionHistory[] = await prisma.$queryRawUnsafe(
    `
		SELECT 
				q.id, 
				q.question,
				q."revealAtDate",
				cr."rewardTokenAmount" as "claimedAmount",
				CASE 
						WHEN COUNT(CASE WHEN qa.selected = true THEN 1 ELSE NULL END) > 0 THEN true
						ELSE false 
				END AS "isAnswered",
				CASE 
						WHEN COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0 THEN true
						ELSE false 
				END AS "isClaimed",
				CASE 
						WHEN COUNT(CASE WHEN (cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0) OR cr.result = 'Revealed' THEN 1 ELSE NULL END) > 0 THEN true
						ELSE false 
				END AS "isRevealed",
				CASE 
						WHEN COUNT(CASE WHEN cr.result = 'Revealed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) > 0
								AND COUNT(CASE WHEN cr.result = 'Claimed' AND cr."rewardTokenAmount" > 0 THEN 1 ELSE NULL END) = 0 THEN true
						ELSE false 
				END AS "isClaimable",
				CASE 
        		WHEN COUNT(CASE WHEN cr.result = 'Claimed' OR cr.result = 'Revealed' THEN 1 ELSE NULL END) = 0
        			AND q."revealAtDate" < NOW() THEN true
        		ELSE false 
    		END AS "isRevealable"
		FROM 
				"Question" q 
		JOIN 
				"QuestionOption" qo ON qo."questionId" = q.id 
		LEFT JOIN 
				"QuestionAnswer" qa ON qa."questionOptionId" = qo.id AND qa."userId" = '${userId}'
		LEFT JOIN 
				"ChompResult" cr ON cr."questionId" = q.id AND cr."userId" = '${userId}' AND cr."questionId" IS NOT NULL
		WHERE q."revealAtDate" IS NOT NULL
		GROUP BY 
				q.id, cr."rewardTokenAmount"
		ORDER BY 
				q."createdAt" DESC		`,
  );

  return historyResult;
}
