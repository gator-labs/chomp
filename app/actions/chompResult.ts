"use server";

import {
  InvalidBurnTxError,
  RevealConfirmationError,
  RevealError,
} from "@/lib/error";
import { FungibleAsset, ResultType, TransactionStatus } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { revalidatePath } from "next/cache";

import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import { questionAnswerCountQuery } from "../queries/questionAnswerCountQuery";
import prisma from "../services/prisma";
import { calculateReward } from "../utils/algo";
import { acquireMutex } from "../utils/mutex";
import { calculateRevealPoints } from "../utils/points";
import { isEntityRevealable } from "../utils/question";
import { sleep } from "../utils/sleep";
import { CONNECTION, isValidSignature } from "../utils/solana";
import { getJwtPayload } from "./jwt";

export async function revealDeck(deckId: number, burnTx?: string) {
  const decks = await revealDecks([deckId], burnTx);
  return decks ? decks[0] : null;
}

export async function revealQuestion(questionId: number, burnTx?: string) {
  const questions = await revealQuestions([questionId], burnTx);
  return questions ? questions[0] : null;
}

export async function revealDecks(deckIds: number[], burnTx?: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const questionIds = await prisma.deckQuestion.findMany({
    where: {
      deckId: { in: deckIds },
    },
    select: { questionId: true },
  });

  await revealQuestions(
    questionIds.map((q) => q.questionId),
    burnTx,
  );
  revalidatePath("/application");
}

export async function revealQuestions(questionIds: number[], burnTx?: string) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "REVEAL",
    data: { userId: payload.sub },
  });

  if (!isValidSignature(burnTx)) {
    const invalidBurnTxError = new InvalidBurnTxError(
      `Invalid burn tx provided for user ${payload.sub}`,
    );
    Sentry.captureException(invalidBurnTxError, {
      extra: {
        questionIds,
      },
    });
    release();
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }

  await handleFirstRevealToPopulateSubjectiveQuestion(questionIds);
  const questionsFilteredForUser = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
    },
    include: {
      chompResults: {
        where: {
          userId: payload.sub,
        },
      },
    },
  });
  const questionAnswersCount = await questionAnswerCountQuery(questionIds);

  const revealableQuestions = questionsFilteredForUser.filter((question) =>
    isEntityRevealable({
      revealAtAnswerCount: question.revealAtAnswerCount,
      revealAtDate: question.revealAtDate,
      answerCount:
        questionAnswersCount.find((qa) => qa.id === question.id)?.count ?? 0,
    }),
  );

  if (!revealableQuestions.length) {
    release();
    throw new Error("No revealable questions available");
  }

  const bonkToBurn = revealableQuestions.reduce(
    (acc, cur) => acc + cur.revealTokenAmount,
    0,
  );

  if (bonkToBurn > 0) {
    const bonkBurned = await hasBonkBurnedCorrectly(
      burnTx,
      bonkToBurn,
      payload.sub,
    );
    if (!bonkBurned) {
      release();
      return null;
    }
  }

  const revealableQuestionIds = revealableQuestions.map((q) => q.id);

  const questionRewards = await calculateReward(
    payload.sub,
    revealableQuestionIds,
  );

  const revealPoints = await calculateRevealPoints(questionRewards);

  if (!burnTx) {
    const revealError = new RevealError(
      `User with id: ${payload?.sub} is missing transaction hash for revealing question ids: ${questionIds}`,
    );
    release();
    Sentry.captureException(revealError, {
      extra: {
        questionIds,
        burnTx,
      },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }

  const pendingChompResults = await prisma.chompResult.findMany({
    where: {
      userId: payload.sub,
      questionId: {
        in: revealableQuestionIds,
      },
      burnTransactionSignature: burnTx,
      transactionStatus: TransactionStatus.Pending,
    },
  });

  const updatedRewards = questionRewards.map((reward) => {
    const matchingResult = pendingChompResults.find(
      (result) => result.questionId === reward.questionId,
    );
    return {
      ...reward,
      chompResultId: matchingResult?.id,
    };
  });

  await Promise.all(
    updatedRewards.map((qr) =>
      prisma.chompResult.update({
        where: {
          id: qr.chompResultId,
          userId: payload.sub,
          questionId: qr.questionId,
          burnTransactionSignature: burnTx,
          transactionStatus: TransactionStatus.Pending,
        },
        data: {
          burnTransactionSignature: burnTx,
          rewardTokenAmount: qr.rewardAmount,
          transactionStatus: TransactionStatus.Completed,
        },
      }),
    ),
  );

  try {
    await prisma.fungibleAssetTransactionLog.createMany({
      data: revealPoints?.map((revealPointsTx) => ({
        asset: FungibleAsset.Point,
        type: revealPointsTx.type,
        change: revealPointsTx.amount,
        userId: payload.sub,
        questionId: revealPointsTx.questionId,
      })),
    });
  } catch (error) {
    const questionIds = questionRewards.map((item) => item.questionId);
    const existingFatl = await prisma.fungibleAssetTransactionLog.findMany({
      where: {
        questionId: {
          in: questionIds,
        },
      },
      select: {
        id: true,
        type: true,
        createdAt: true,
        questionId: true,
      },
    });
    const revealError = new RevealError(
      `Reveal warning for user ${payload?.sub} and ${questionIds}. Reveal will continue successfully, but unable to create new FATL.`,
      {
        cause: error,
      },
    );
    Sentry.captureException(revealError, {
      extra: {
        existingFatl: existingFatl,
        newFatl: revealPoints,
        questionIds: questionIds,
      },
    });
  }

  release();
  await Sentry.flush(SENTRY_FLUSH_WAIT);
  revalidatePath("/application");
}

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

// tx validation with 5 retries with a delay of 1s
async function hasBonkBurnedCorrectly(
  burnTx: string | undefined,
  bonkToBurn: number,
  userId: string,
): Promise<boolean> {
  if (!burnTx) {
    return false;
  }

  const wallets = (
    await prisma.wallet.findMany({
      where: {
        userId,
      },
    })
  ).map((wallet) => wallet.address);

  let transaction;
  const interval = 5000;
  const maxRetries = 6;
  let attempts = 0;

  while (!transaction && attempts < maxRetries) {
    try {
      transaction = await CONNECTION.getParsedTransaction(burnTx, {
        commitment: "finalized",
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error("Error fetching transaction, retrying...", error);
    }

    if (!transaction) {
      attempts++;
      await sleep(interval);
    }
  }

  if (!transaction || transaction.meta?.err) {
    return false;
  }

  const burnTransactionCount = await prisma.chompResult.count({
    where: {
      burnTransactionSignature: burnTx,
      transactionStatus: TransactionStatus.Completed,
      questionId: {
        not: null,
      },
    },
  });

  const burnInstruction = transaction.transaction.message.instructions.find(
    (instruction) =>
      "parsed" in instruction &&
      +instruction.parsed.info.tokenAmount.amount >=
        bonkToBurn * 10 ** 5 * (burnTransactionCount + 1) &&
      instruction.parsed.type === "burnChecked" &&
      wallets.includes(instruction.parsed.info.authority) &&
      instruction.parsed.info.mint === process.env.NEXT_PUBLIC_BONK_ADDRESS,
  );

  if (!burnInstruction) {
    const revealError = new RevealConfirmationError(
      `Unable to validate tx for User id: ${userId} and (wallet: ${JSON.stringify(wallets)})`,
    );
    Sentry.captureException(revealError, {
      tags: {
        category: "reveal-tx-confirmation-error",
      },
      extra: { burnInstruction: burnInstruction },
    });
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return false;
  }

  return true;
}

/**
 * The function `handleFirstRevealToPopulateSubjectiveQuestion` retrieves questions with their options
 * and answers and calculates correct answers.
 * @param {number[]} questionIds - The `questionIds` parameter is an array of numbers representing the
 * IDs of questions that need to be processed.
 *
 */
async function handleFirstRevealToPopulateSubjectiveQuestion(
  questionIds: number[],
) {
  const questions = await prisma.question.findMany({
    where: {
      id: { in: questionIds },
    },
    include: {
      questionOptions: {
        include: {
          questionAnswers: true,
        },
      },
    },
  });

  const revealableQuestionIds = questions
    ?.filter((question) => isEntityRevealable(question))
    ?.map((q) => q?.id);

  const uncalculatedQuestionOptionCount = await prisma.questionOption.count({
    where: {
      OR: [
        { calculatedIsCorrect: null },
        { calculatedAveragePercentage: null },
      ],
      questionId: {
        in: revealableQuestionIds,
      },
    },
  });

  if (uncalculatedQuestionOptionCount > 0) {
    throw new Error("Unsupported operation. Unable to calculate answer.");
  }
}
