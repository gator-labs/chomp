import { redirect } from "next/navigation";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

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

type TotalRevealedRewardsQueryResult = {
  totalRevealedRewards: number;
};

export async function getHistory(
  sort: HistorySortOptions = HistorySortOptions.Date,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }
  const userId = payload.sub;
  const getSort = () => {
    switch (sort) {
      case HistorySortOptions.Claimable:
        return '"isRevealed" desc, "revealAtDate"';
      case HistorySortOptions.Date:
        return '"revealAtDate"';
      case HistorySortOptions.Revealed:
        return '"isRevealable" desc, "revealAtDate"';
    }

    return '"revealAtDate"';
  };

  const response: HistoryResult[] = await prisma.$queryRawUnsafe(`
select
*
from
(
	( 
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
					(
					select
						count(distinct concat(qa."userId",qo."questionId"))
					from public."QuestionOption" qo
					join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
					where qo."questionId" = q."id"
					)
				)
			) as "isRevealable",
			(
				q."id" in
				(
					select
						cr."questionId"
					from public."ChompResult" cr
					where cr."questionId" = q."id" and cr."userId" = '${userId}' and cr."result" = 'Revealed'
				)
			) as "isRevealed",
			(
				q."id" in
				(
					select
						cr."questionId"
					from public."ChompResult" cr
					where cr."questionId" = q."id" and cr."userId" = '${userId}' and cr."result" = 'Claimed'
				)
			) as "isClaimed",
			true as "isChomped",
			'Question' as "type"
		from public."Question" q 
		where q."id" in
				(
					select 
						qo."questionId"
					from public."QuestionOption" qo
					join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
					where qa."userId" = '${userId}' and qo."questionId" = q."id"
				)
			and
				q."id" not in
		    	(
		    		select
		    			dq."questionId"
		    		from public."DeckQuestion" dq
		    		where dq."questionId" = q."id"
		    	)
	)
	union
	(
		select
			d."id",
			d."deck",
			d."revealAtDate",
			(
				select
					count(distinct concat(qa."userId", dq."deckId"))
				from public."QuestionOption" qo
				join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
				join public."DeckQuestion" dq on dq."questionId"  = qo."questionId"
				where dq."deckId" = d."id"
			) as "answerCount",
			d."revealAtAnswerCount",
			0 as "revealTokenAmount",
			(
				(
				d."revealAtDate" is not null 
				and 
				d."revealAtDate" < now() 
				)
				or 
				(
				d."revealAtAnswerCount" is not null
				and
				d."revealAtAnswerCount" >=
					(
					select
						count(distinct concat(qa."userId", dq."deckId"))
					from public."QuestionOption" qo
					join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
					join public."DeckQuestion" dq on dq."questionId"  = qo."questionId"
					where dq."deckId" = d."id"
					)
				)
			) as "isRevealable",
			(
				d."id" in
				(
					select
						cr."deckId"
					from public."ChompResult" cr
					where cr."deckId" = d."id" and cr."userId" = '${userId}' and cr."result" = 'Revealed'
				)
			) as "isRevealed",
			(
				d."id" in
				(
					select
						cr."deckId"
					from public."ChompResult" cr
					where cr."deckId" = d."id" and cr."userId" = '${userId}' and cr."result" = 'Claimed'
				)
			) as "isClaimed",
			(
				(
					select 
						count(distinct dq."deckId" + dq."questionId")
					from public."QuestionOption" qo
					join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
					join public."DeckQuestion" dq on dq."questionId"  = qo."questionId"
					where qa."userId" = '${userId}' and dq."deckId" = d."id"
					limit 1
				)
				=
				(
					select 
						count(distinct dq."deckId" + dq."questionId")
					from public."DeckQuestion" dq
					where dq."deckId" = d."id"
					limit 1
				)
			) as "isChomped",
			'Deck' as "type"
		from public."Deck" d 
		where d."id" in
			(
				select 
					dq."deckId"
				from public."QuestionOption" qo
				join public."QuestionAnswer" qa on qa."questionOptionId" = qo."id"
				join public."DeckQuestion" dq on dq."questionId"  = qo."questionId"
				where qa."userId" = '${userId}' and dq."deckId" = d."id"
			)
	)
)
order by ${getSort()}
`);

  return response;
}

export async function getTotalRevealedRewards(): Promise<number> {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/login");
  }
  const userId = payload.sub;

  const response: TotalRevealedRewardsQueryResult[] = await prisma.$queryRaw`
	select 
	coalesce(sum(cr."rewardTokenAmount"), 0) as "totalRevealedRewards"
	from public."ChompResult" cr
	where cr."userId" = ${userId} and cr."result" = 'Revealed'
	`;

  return response[0].totalRevealedRewards;
}
