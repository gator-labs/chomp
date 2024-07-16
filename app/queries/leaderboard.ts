"use server";

import prisma from "../services/prisma";

export const getNumberOfChompedQuestionsOfCampaignQuery = async (
  campaignId: number,
) => {
  return prisma.$queryRaw<{ questionsAnswered: number; userId: string }[]>`
      SELECT
      COUNT(distinct (qo."questionId", qa."userId" )) AS "questionsAnswered",
      qa."userId" 
      FROM 
      public."QuestionAnswer" qa
      JOIN 
      public."QuestionOption" qo 
      ON 
      qa."questionOptionId" = qo."id"
      JOIN public."Question" 
      q ON q.id  = qo."questionId" 
      WHERE q."campaignId" = ${campaignId}
      GROUP BY 
      qa."userId"
      ORDER BY "questionsAnswered" desc
      `;
};

export const getNumberOfChompedQuestionsQuery = async (
  startDate: Date,
  endDate: Date,
) => {
  return prisma.$queryRaw<{ questionsAnswered: number; userId: string }[]>`
      SELECT
      COUNT(distinct (qo."questionId", qa."userId" )) AS "questionsAnswered",
      qa."userId" 
      FROM 
      public."QuestionAnswer" qa
      JOIN 
      public."QuestionOption" qo 
      ON 
      qa."questionOptionId" = qo."id"
      JOIN public."Question" 
      q ON q.id  = qo."questionId" 
      WHERE qa."createdAt" >= ${startDate} and qa."createdAt" <= ${endDate}
      GROUP BY 
      qa."userId"
      ORDER BY "questionsAnswered" desc
      `;
};
