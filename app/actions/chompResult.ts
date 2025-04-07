"use server";

import { InvalidBurnTxError } from "@/lib/error";
import { ResultType, TransactionStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import prisma from "../services/prisma";
import { CONNECTION, isValidSignature } from "../utils/solana";
import { getJwtPayload } from "./jwt";

export async function dismissQuestion(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const chompResult = await prisma.chompResult.findFirst({
    where: {
      userId: payload.sub,
      questionId: questionId,
    },
  });

  await prisma.chompResult.upsert({
    create: {
      result: ResultType.Dismissed,
      userId: payload.sub,
      questionId: questionId,
      transactionStatus: TransactionStatus.Completed,
    },
    update: {
      result: ResultType.Dismissed,
    },
    where: {
      id: chompResult?.id ?? 0,
    },
  });

  revalidatePath("/application");
}

export async function createQuestionChompResults(
  questionChomps: { questionId: number; burnTx: string }[],
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  if (questionChomps.some((qc) => !isValidSignature(qc.burnTx))) {
    const invalidBurnTxError = new InvalidBurnTxError(
      `Invalid burn tx provided for user ${payload.sub}`,
    );
    Sentry.captureException(invalidBurnTxError, {
      extra: {
        questionIds: questionChomps.map((qc) => qc.questionId),
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }

  return await prisma.$transaction(
    questionChomps.map((qc) =>
      prisma.chompResult.create({
        data: {
          userId: payload.sub,
          transactionStatus: TransactionStatus.Pending,
          questionId: qc.questionId,
          result: ResultType.Revealed,
          burnTransactionSignature: qc.burnTx,
        },
      }),
    ),
  );
}

export async function createQuestionChompResult(
  questionId: number,
  burnTx: string,
) {
  const results = await createQuestionChompResults([{ questionId, burnTx }]);

  if (!results) {
    return null;
  }

  return results;
}

/**
 * Creates chomp results for the given question IDs, before
 * submitting the transaction (already signed by the user)
 * to the chain.
 *
 * @param questionIds  Array of question IDs.
 * @param serializedTx Burn transaction, serialized and already signed.
 * @param signature    Signature of the above transaction.
 *
 * @return results    An array of created chomp results.
 */
export async function createChompResultsAndSubmitSignedTx(
  questionIds: number[],
  serializedTx: string,
  signature: string,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  const tx = new Uint8Array(JSON.parse(serializedTx));

  const chompResults = await createQuestionChompResults(
    questionIds.map((qid) => ({
      burnTx: signature,
      questionId: qid,
    })),
  );

  try {
    await CONNECTION.sendRawTransaction(tx);
  } catch (e) {
    deleteQuestionChompResults(questionIds);
    throw e;
  }

  return chompResults;
}

export async function deleteQuestionChompResults(ids: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await prisma.chompResult.deleteMany({
    where: {
      id: { in: ids },
      userId: payload.sub,
    },
  });
}

export async function deleteQuestionChompResult(id: number) {
  return await deleteQuestionChompResults([id]);
}

export async function getUsersPendingChompResult(questionIds: number[]) {
  const payload = await getJwtPayload();

  if (!payload) {
    return [];
  }

  return prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      transactionStatus: TransactionStatus.Pending,
      questionId: {
        in: questionIds,
      },
    },
  });
}
