/*
  THIS API PROCESS THE BURN AND CLAIM OF SELECTED QUESTIONS
*/

import { MINIMAL_ANSWER_COUNT } from "@/app/constants/answers";
import {
  claimAllSelected,
  revealAllSelected,
} from "@/app/queries/processBurnClaim";
import { queryQuestionsForReadyToReveal } from "@/app/queries/home";
import prisma from "@/app/services/prisma";
import { headers } from "next/headers";

export async function GET(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || Array.isArray(userId)) {
    return Response.json("userId parameter is required", { status: 400 });
  }

  const questions = await queryQuestionsForReadyToReveal(userId);

  const questionMinAnswerFilter = questions.filter(
    (question) =>
      question.answerCount && question.answerCount >= MINIMAL_ANSWER_COUNT,
  );

  return Response.json(questionMinAnswerFilter);
}

export async function POST(req: Request) {
  const headersList = headers();
  const apiKey = headersList.get("api-key");
  if (apiKey !== process.env.BOT_API_KEY) {                       // Validates API key for authentication
    return new Response(`Invalid api-key`, {
      status: 400,
    });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId || Array.isArray(userId)) {
    return Response.json("userId parameter is required", { status: 400 });
  }

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!userWallet) {
    return Response.json("No wallet found for the user", { status: 400 });
  }

  const data = await req.json();
  const { questionIds, burnTx } = data;

  try {
    await revealAllSelected(questionIds, userId, burnTx);
    const results = await claimAllSelected(
      questionIds,
      userId,
      userWallet?.address,
    );
    return Response.json(results?.chompResults);
  } catch (e) {
    console.log(e);
    return Response.json("Error at reveal", { status: 400 });
  }
}
