"use server";

import { RevealConfirmationError, RevealError } from "@/lib/error";
import {
  FungibleAsset,
  NftType,
  ResultType,
  TransactionStatus,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
import { TransactionSignature } from "@solana/web3.js";
import { revalidatePath } from "next/cache";

import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import { questionAnswerCountQuery } from "../queries/questionAnswerCountQuery";
import prisma from "../services/prisma";
import { calculateCorrectAnswer, calculateReward } from "../utils/algo";
import { acquireMutex } from "../utils/mutex";
import { calculateRevealPoints } from "../utils/points";
import { isEntityRevealable } from "../utils/question";
import { sleep } from "../utils/sleep";
import { CONNECTION } from "../utils/solana";
import { getJwtPayload } from "./jwt";
import { checkNft } from "./revealNft";

export async function revealDeck(
  deckId: number,
  burnTx?: string,
  nftAddress?: string,
) {
  const decks = await revealDecks([deckId], burnTx, nftAddress);
  return decks ? decks[0] : null;
}

export async function revealQuestion(
  questionId: number,
  burnTx?: string,
  nftAddress?: string,
  nftType?: NftType,
) {
  const questions = await revealQuestions(
    [questionId],
    burnTx,
    nftAddress,
    nftType,
  );
  return questions ? questions[0] : null;
}

export async function revealDecks(
  deckIds: number[],
  burnTx?: string,
  nftAddress?: string,
  nftType?: NftType,
) {
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
    nftAddress,
    nftType,
  );
  revalidatePath("/application");
}

export async function revealQuestions(
  questionIds: number[],
  burnTx?: string,
  nftAddress?: string,
  nftType?: NftType,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "REVEAL",
    data: { userId: payload.sub },
  });

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

  const isRevealedWithNft =
    nftAddress && nftType && (await checkNft(nftAddress, nftType));

  const bonkToBurn = revealableQuestions
    .slice(isRevealedWithNft ? 1 : 0) // skip bonk burn for first question if nft is supplied
    .reduce((acc, cur) => acc + cur.revealTokenAmount, 0);

  if (bonkToBurn > 0) {
    const txStatus = await pollTransactionConfirmation(
      burnTx || "",
      questionIds,
      payload.sub,
    );
    if (!txStatus) {
      const pendingTxStatus = await hasBonkBurnedCorrectly(
        burnTx,
        bonkToBurn,
        payload.sub,
      );
      if (!pendingTxStatus) {
        release();
        return null;
      }
    }
  }

  const revealableQuestionIds = revealableQuestions.map((q) => q.id);

  const questionRewards = await calculateReward(
    payload.sub,
    revealableQuestionIds,
  );

  const revealPoints = await calculateRevealPoints(questionRewards);

  let revealNftId: string | null = null;

  if (isRevealedWithNft) {
    const revealNft = await prisma.revealNft.create({
      data: {
        userId: payload.sub,
        nftType,
        nftId: nftAddress,
      },
    });
    revealNftId = revealNft.nftId;
  }

  if (!revealNftId && !burnTx) {
    const revealError = new RevealError(
      `User with id: ${payload?.sub} is missing transaction hash or nft for revealing question ids: ${questionIds}`,
    );
    release();
    Sentry.captureException(revealError);
    return null;
  }

  if (revealNftId) {
    await prisma.chompResult.createMany({
      data: questionRewards.map((questionReward) => ({
        questionId: questionReward.questionId,
        userId: payload.sub,
        result: ResultType.Revealed,
        burnTransactionSignature: burnTx,
        rewardTokenAmount: questionReward.rewardAmount,
        transactionStatus: TransactionStatus.Completed,
        revealNftId,
      })),
    });
  } else {
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
            revealNftId,
          },
        }),
      ),
    );
  }

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
      },
    });
  }

  release();
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
  const interval = 1000;
  const maxRetries = 5;
  let attempts = 0;

  while (!transaction && attempts < maxRetries) {
    try {
      transaction = await CONNECTION.getParsedTransaction(burnTx, {
        commitment: "confirmed",
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
    return false;
  }

  return true;
}

/**
 * Validate transaction for chomp result to mark them as complete
 * Run for 15s with an interval of 5s
 *
 * @param userId        User ID.
 * @param txnSig      Burn Tx Sign
 * @param pendingChompResultQuestionIds chompresults will be in pending state
 * after user start reveal
 *
 *
 * @return status boolean
 */
async function pollTransactionConfirmation(
  txnSig: TransactionSignature,
  pendingChompResultQuestionIds: number[],
  userId: string,
): Promise<boolean> {
  const timeout = 15000; // 15 seconds
  const interval = 5000; // 5 seconds
  let elapsed = 0;

  return new Promise<boolean>((resolve) => {
    const intervalId = setInterval(async () => {
      elapsed += interval;

      if (elapsed >= timeout) {
        clearInterval(intervalId);
        resolve(false); // Return false on timeout
        return;
      }

      try {
        const status = await CONNECTION.getSignatureStatuses([txnSig]);

        if (
          status?.value[0]?.confirmationStatus === "confirmed" ||
          status?.value[0]?.confirmationStatus === "finalized"
        ) {
          clearInterval(intervalId);
          resolve(true); // Return true if confirmed or finalized
        }
      } catch (error) {
        console.error("Error checking transaction status:", error);

        const revealError = new RevealConfirmationError(
          `Unable to validate tx for User id: ${userId} and (questionIds: ${pendingChompResultQuestionIds}})`,
          { cause: error },
        );
        Sentry.captureException(revealError, {
          tags: {
            category: "reveal-tx-confirmation-error",
          },
        });

        await Sentry.flush(SENTRY_FLUSH_WAIT);
        clearInterval(intervalId);
        resolve(false); // Return false if an error occurs
      }
    }, interval);
  });
}

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
    await calculateCorrectAnswer(revealableQuestionIds);
  }
}
