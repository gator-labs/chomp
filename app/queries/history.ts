import { redirect } from "next/navigation";
import { getAllRevealableQuestions } from "../actions/claim";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { onlyUniqueBy } from "../utils/array";

export type HistoryResult = {
  id: number;
  question: string;
  revealAtDate: Date;
  revealAtAnswerCount: number;
  revealTokenAmount: number;
  isRevealable: boolean;
  isRevealed: boolean;
  isClaimed: boolean;
  isChomped: boolean;
  type: "Question" | "Deck";
};

export enum HistorySortOptions {
  Date = "Date",
  Revealed = "Revealed",
  Claimable = "Claimable",
}

export enum HistoryTypeOptions {
  Deck = "Deck",
  Question = "Question",
}

export async function getHistory(
  sort: HistorySortOptions = HistorySortOptions.Date,
  type: HistoryTypeOptions = HistoryTypeOptions.Deck,
): Promise<HistoryResult[]> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }
  const userId = payload.sub;
  const sortClause = getSortClause(sort);

  switch (type) {
    case HistoryTypeOptions.Deck:
      return await getDecksHistory(userId, sortClause);
    case HistoryTypeOptions.Question:
      return await getQuestionsHistory(userId, sortClause);
    default:
      return await getDecksHistory(userId, sortClause);
  }
}

export async function getTotalRevealedRewards(): Promise<number> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }

  const revealableQuestions = await getAllRevealableQuestions();
  const totalRevealedRewards = revealableQuestions!
    .filter(onlyUniqueBy((x) => x.burnTransactionSignature))
    .reduce((acc, curr) => acc + (curr.rewardTokenAmount?.toNumber() ?? 0), 0);

  return totalRevealedRewards;
}

export function getSortClause(sort: string): string {
  switch (sort) {
    case HistorySortOptions.Claimable:
      return '"isRevealed" desc, "revealAtDate"';
    case HistorySortOptions.Date:
      return '"revealAtDate"';
    case HistorySortOptions.Revealed:
      return '"isRevealable" desc, "revealAtDate"';
    default:
      return '"revealAtDate"';
  }
}

export async function getDecksHistory(
  userId: string,
  sortClause: string,
): Promise<HistoryResult[]> {
  const decksHistory: HistoryResult[] = await prisma.$queryRawUnsafe(
    `
	SELECT * FROM (
	    SELECT  d."id",
				d."deck",
				d."revealAtDate",
				(SELECT COUNT(DISTINCT CONCAT(qa."userId", dq."deckId"))
					FROM public."QuestionOption" qo
							JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
							JOIN public."DeckQuestion" dq ON dq."questionId" = qo."questionId"
					WHERE dq."deckId" = d."id") AS "answerCount",
				d."revealAtAnswerCount",
				0                            AS "revealTokenAmount",
				(
					(
						d."revealAtDate" IS NOT NULL
							AND
						d."revealAtDate" < NOW()
						)
						OR
					(
						d."revealAtAnswerCount" IS NOT NULL
							AND
						d."revealAtAnswerCount" >=
						(SELECT COUNT(DISTINCT CONCAT(qa."userId", dq."deckId"))
							FROM public."QuestionOption" qo
									JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
									JOIN public."DeckQuestion" dq ON dq."questionId" = qo."questionId"
							WHERE dq."deckId" = d."id")
						)
					)                        AS "isRevealable",
				(
					d."id" IN
					(SELECT cr."deckId"
						FROM public."ChompResult" cr
						WHERE cr."deckId" = d."id"
						AND cr."userId" = '${userId}'
						AND cr."result" = 'Revealed')
					)                        AS "isRevealed",
				(
					d."id" IN
					(SELECT cr."deckId"
						FROM public."ChompResult" cr
						WHERE cr."deckId" = d."id"
						AND cr."userId" = '${userId}'
						AND cr."result" = 'Claimed')
					)                        AS "isClaimed",
				(
					(SELECT COUNT(DISTINCT dq."deckId" + dq."questionId")
						FROM public."QuestionOption" qo
								JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
								JOIN public."DeckQuestion" dq ON dq."questionId" = qo."questionId"
						WHERE qa."userId" = '${userId}'
						AND dq."deckId" = d."id"
						LIMIT 1)
						=
					(SELECT COUNT(DISTINCT dq."deckId" + dq."questionId")
						FROM public."DeckQuestion" dq
						WHERE dq."deckId" = d."id"
						LIMIT 1)
					)                        AS "isChomped",
				'Deck'                       AS "type"
			FROM public."Deck" d
			WHERE d."id" IN
				(SELECT dq."deckId"
				FROM public."QuestionOption" qo
							JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
							JOIN public."DeckQuestion" dq ON dq."questionId" = qo."questionId"
				WHERE qa."userId" = '${userId}'
					AND dq."deckId" = d."id")) AS deckHistory
			ORDER BY ${sortClause};
		`,
  );

  return decksHistory;
}

export async function getQuestionsHistory(
  userId: string,
  sortClause: string,
): Promise<HistoryResult[]> {
  const historyResult: HistoryResult[] = await prisma.$queryRawUnsafe(
    `
			SELECT  * FROM (
				SELECT  q."id",
						q."question",
						q."revealAtDate",
						(SELECT count(distinct concat(qa."userId", qo."questionId"))
						FROM public."QuestionOption" qo
								join public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
						where qo."questionId" = q."id") AS "answerCount",
						q."revealAtAnswerCount",
						q."revealTokenAmount",
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
								(SELECT count(distinct concat(qa."userId", qo."questionId"))
								FROM public."QuestionOption" qo
										join public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
								where qo."questionId" = q."id")
								)
							)                            AS "isRevealable",
						(
							q."id" IN
							(SELECT cr."questionId"
							FROM public."ChompResult" cr
							where cr."questionId" = q."id"
							and cr."userId" = '${userId}'
							and cr."result" = 'Revealed')
							)                            AS "isRevealed",
						(
							q."id" IN
							(SELECT cr."questionId"
							FROM public."ChompResult" cr
							where cr."questionId" = q."id"
							and cr."userId" = '${userId}'
							and cr."result" = 'Claimed')
							)                            AS "isClaimed",
						true                             AS "isChomped",
						'Question'                       AS "type"
				FROM public."Question" q
				where q."id" IN
					(SELECT qo."questionId"
						FROM public."QuestionOption" qo
								join public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
						where qa."userId" = '${userId}'
						and qo."questionId" = q."id")
				and q."id" not IN
					(SELECT dq."questionId"
						FROM public."DeckQuestion" dq
						where dq."questionId" = q."id")) AS QuestionHistory
				ORDER BY ${sortClause};
		`,
  );

  return historyResult;
}
