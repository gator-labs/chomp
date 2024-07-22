import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import prisma from "@/app/services/prisma";
import dayjs from "dayjs";
import { getRandomElement } from "@/app/utils/randomUtils";
import { queryQuestionsForReadyToReveal } from "@/app/queries/home";
import { MINIMAL_ANSWER_COUNT } from "@/app/constants/answers";


export async function GET(req: Request) {

  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId|| Array.isArray(userId)) {
    return Response.json("userId parameter is required", { status: 400 });
  }

  const questions = await queryQuestionsForReadyToReveal(userId);

  const questionMinAnswerFilter = questions.filter(
    (question) =>
      question.answerCount && question.answerCount >= MINIMAL_ANSWER_COUNT,
  );
  return Response.json(questionMinAnswerFilter);

}
