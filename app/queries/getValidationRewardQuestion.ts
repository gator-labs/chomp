"use server";

import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { filterQuestionsByMinimalNumberOfAnswers } from "../utils/question";

/**
 * Retrieves validation reward questions for the authenticated user.
 *
 * This function fetches the JWT payload to identify the user and then queries the database
 * to get a list of questions that meet specific criteria for validation rewards.
 *
 * @returns {Promise<{ id: number; answerCount: number; question: string; }[] | null>}
 *          A promise that resolves to an array of questions with their IDs, answer counts,
 *          and question texts, or null if the payload is not available.
 *
 * The questions are filtered based on the following conditions:
 * - The question has a reveal date that is in the past.
 * - The question has a minium number of answers. (See filterQuestionsByMinimalNumberOfAnswers)
 * - The user has not already triggered a validation reward for the question.
 * - The user has selected an answer for the question, and the answer is either correct or has a calculated average percentage.
 * - The user has been charged for the question as a premium question.
 */
export const getValidationRewardQuestions = async (): Promise<
  { id: number; answerCount: number; question: string }[] | null
> => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }
  const userId = payload.sub;

  const questions = await prisma.$queryRaw<
    {
      id: number;
      answerCount: number;
      question: string;
    }[]
  >`
WITH MysteryBoxCte AS (
    SELECT 
        mbt."questionId"
    FROM 
        public."MysteryBox" mb
    JOIN 
        public."MysteryBoxTrigger" mbt ON mb.id = mbt."mysteryBoxId"
    WHERE 
        mbt."triggerType" = 'ValidationReward'
        AND mb."status" = 'Opened'
        AND mb."userId" = ${userId}
)
SELECT 
    q.id,
FROM 
    public."Question" q
JOIN 
    public."FungibleAssetTransactionLog" fatl ON q.id = fatl."questionId"
WHERE 
    q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
  AND NOT EXISTS (
        SELECT 1
        FROM MysteryBoxCte
        WHERE MysteryBoxCte."questionId" = q.id
    )
    AND EXISTS (
    SELECT 1
    FROM public."QuestionOption" qo
    JOIN public."QuestionAnswer" qa ON qo.id = qa."questionOptionId"
    WHERE 
        qo."questionId" = q.id
        AND qa."userId" = ${userId}
        AND qo."calculatedAveragePercentage" IS NOT NULL
        AND qa."percentage" IS NOT NULL)
    AND fatl."userId" = ${userId}
    AND fatl."change" = -q."creditCostPerQuestion"
    AND fatl."type" = 'PremiumQuestionCharge'
    AND fatl."change" < 0;
	`;

  return filterQuestionsByMinimalNumberOfAnswers(questions);
};
