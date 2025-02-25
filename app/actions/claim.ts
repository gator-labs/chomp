"use server";

import { sendClaimedBonkFromTreasury } from "@/lib/claim";
import { ClaimError, SendBonkError } from "@/lib/error";
import { ResultType } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import _ from "lodash";
import { revalidatePath } from "next/cache";

import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import prisma from "../services/prisma";
import { ONE_MINUTE_IN_MILLISECONDS } from "../utils/dateUtils";
import { acquireMutex } from "../utils/mutex";
import { getJwtPayload } from "./jwt";

export async function claimQuestion(questionId: number) {
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
      sendTransactionSignature: null,
      rewardTokenAmount: {
        gt: 0,
      },
      OR: [
        {
          burnTransactionSignature: {
            not: null,
          },
        },
        {
          revealNftId: {
            not: null,
          },
        },
      ],
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

  const claimResult = await claimQuestions(claimableQuestionIds);

  return {
    ...claimResult,
  };
}

export async function claimQuestions(questionIds: number[]) {
  const payload = await getJwtPayload();
  let sendTx: string | null = null;
  let resultIds: number[] = [];

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
        sendTransactionSignature: null,
        result: ResultType.Revealed,
        OR: [
          {
            burnTransactionSignature: {
              not: null,
            },
          },
          {
            revealNftId: {
              not: null,
            },
          },
        ],
      },
      include: {
        question: true,
      },
    });

    const burnTxHashes = _.uniq(
      chompResults
        .filter((cr) => !!cr.burnTransactionSignature)
        .map((cr) => cr.burnTransactionSignature!),
    );

    const revealNftIds = _.uniq(
      chompResults
        .filter((cr) => !!cr.revealNftId)
        .map((cr) => cr.revealNftId!),
    );

    const numberOfAnsweredQuestions = (
      await prisma.chompResult.findMany({
        where: {
          OR: [
            {
              burnTransactionSignature: {
                in: burnTxHashes,
              },
            },
            {
              revealNftId: {
                in: revealNftIds,
              },
            },
          ],
        },
      })
    ).length;

    const userWallet = await prisma.wallet.findFirst({
      where: {
        userId: payload.sub,
      },
    });

    if (!userWallet) {
      return;
    }

    resultIds = chompResults.map((r) => r.id);
    sendTx = await sendClaimedBonkFromTreasury(
      chompResults,
      userWallet.address,
    );

    if (!sendTx) {
      const sendBonkError = new SendBonkError(
        `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for questions: ${questionIds}`,
        { cause: "Failed to send bonk" },
      );
      Sentry.captureException(sendBonkError, {
        level: "fatal",
        tags: {
          category: "claim-tx-confirmation-error",
        },
        extra: {
          chompResults: chompResults?.map((r) => r.id),
          transactionHash: sendTx,
        },
      });
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.chompResult.updateMany({
          where: {
            id: {
              in: chompResults.map((r) => r.id),
            },
          },
          data: {
            result: ResultType.Claimed,
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
      correctAnswers: chompResults.filter(
        (cr) => (cr.rewardTokenAmount?.toNumber() ?? 0) > 0,
      ).length,
      numberOfAnsweredQuestions,
    };
  } catch (e) {
    const claimError = new ClaimError(
      `User with id: ${payload.sub} is having trouble claiming for questions ids: ${questionIds}`,
      { cause: e },
    );
    Sentry.captureException(claimError, {
      extra: {
        questionIds,
        chompResults: resultIds,
        transactionHash: sendTx,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    release();
    throw e;
  }
}
