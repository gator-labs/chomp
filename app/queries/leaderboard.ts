"use server";

import prisma from "../services/prisma";

export const getNumberOfChompedQuestionsOfStackQuery = async (
  stackId: number,
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
      WHERE q."stackId" = ${stackId}
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

export const getAllTimeChompedQuestionsQuery = async () => {
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
      GROUP BY 
      qa."userId"
      ORDER BY "questionsAnswered" desc
      `;
};
