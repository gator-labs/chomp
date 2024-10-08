"use server";

import { ChompResult, ResultType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import { revalidatePath } from "next/cache";
import prisma from "../services/prisma";
import { sendBonk } from "../utils/bonk";
import { ONE_MINUTE_IN_MILLISECONDS } from "../utils/dateUtils";
import { ClaimError } from "../utils/error";
import { acquireMutex } from "../utils/mutex";
import { getBonkBalance, getSolBalance } from "../utils/solana";
import { getJwtPayload } from "./jwt";

export async function claimQuestion(questionId: number) {
  console.log("claim questions fired");
  const questions = await claimQuestions([questionId]);
  return questions ? questions : null;
}

export async function getClaimableQuestionIds(): Promise<number[]> {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  const claimableQuestions = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
      rewardTokenAmount: {
        gt: 0,
      },
    },
    select: {
      questionId: true,
    },
  });

  return claimableQuestions.map(
    (claimableQuestion) => claimableQuestion.questionId!,
  );
}

export async function getAllRevealableQuestions() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const revealableQuestionsAndAmount = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      result: "Revealed",
      questionId: { not: null },
    },
    select: {
      questionId: true,
      rewardTokenAmount: true,
      burnTransactionSignature: true,
    },
  });

  return revealableQuestionsAndAmount;
}

export async function claimAllAvailable() {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const claimableQuestionIds = await getClaimableQuestionIds();

  if (!claimableQuestionIds.length) throw new Error("No claimable questions");

  return claimQuestions(claimableQuestionIds);
}

export async function claimQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: payload.sub },
  });

  try {
    const chompResults = await prisma.chompResult.findMany({
      where: {
        userId: payload.sub,
        questionId: {
          in: questionIds,
        },
        result: ResultType.Revealed,
      },
      include: {
        question: true,
      },
    });

    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId: payload.sub,
      },
    });

    if (!userWallet) {
      return;
    }

    await prisma.chompResult.updateMany({
      where: {
        id: {
          in: chompResults.map((r) => r.id),
        },
      },
      data: {
        result: ResultType.Claimed,
      },
    });

    const sendTx = await handleSendBonk(chompResults, userWallet.address);

    if (!sendTx) throw new Error("Send tx is missing");

    await prisma.$transaction(
      async (tx) => {
        await tx.chompResult.updateMany({
          where: {
            id: {
              in: chompResults.map((r) => r.id),
            },
          },
          data: {
            sendTransactionSignature: sendTx,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );

    release();
    revalidatePath("/application");
    revalidatePath("/application/history");
    return {
      questionIds,
      claimedAmount: chompResults.reduce(
        (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
        0,
      ),
      transactionSignature: sendTx,
      questions: chompResults.map((cr) => cr.question),
    };
  } catch (e) {
    const claimError = new ClaimError(
      `User with id: ${payload.sub} is having trouble claiming for questions ids: ${questionIds}`,
      { cause: e },
    );
    Sentry.captureException(claimError);
    release();
    throw e;
  }
}

async function handleSendBonk(chompResults: ChompResult[], address: string) {
  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  const treasuryAddress = treasuryWallet.publicKey.toString();

  const treasurySolBalance = await getSolBalance(treasuryAddress);
  const treasuryBonkBalance = await getBonkBalance(treasuryAddress);

  if (
    treasurySolBalance < 0.1 ||
    (treasuryBonkBalance < 10000000 && treasuryBonkBalance > 0)
  ) {
    Sentry.captureMessage(
      `Treasury balance low: ${treasurySolBalance} SOL, ${treasuryBonkBalance} BONK. Squads: https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home , Solscan: https://solscan.io/account/${treasuryAddress}#transfers`,
      {
        level: "fatal",
        tags: {
          category: "feedback", // Custom tag to categorize as feedback
        },
        extra: {
          treasurySolBalance,
          treasuryBonkBalance,
          Refill: treasuryAddress,
          Squads: `https://v4.squads.so/squads/${process.env.CHOMP_SQUADS}/home`,
          Solscan: `https://solscan.io/account/${treasuryAddress}#transfers `,
        },
      },
    );
  }

  const tokenAmount = chompResults.reduce(
    (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
    0,
  );

  let sendTx: string | null = null;
  if (tokenAmount > 0) {
    sendTx = await sendBonk(
      treasuryWallet,
      new PublicKey(address),
      Math.round(tokenAmount * 10 ** 5),
    );
  }

  return sendTx;
}
