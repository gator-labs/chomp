"use server";

import { dasUmi } from "@/lib/web3";
import { publicKey } from "@metaplex-foundation/umi";
import { FungibleAsset, ResultType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import {
  COLLECTION_KEY,
  GENESIS_COLLECTION_VALUE,
} from "../constants/genesis-nfts";
import prisma from "../services/prisma";
import { calculateCorrectAnswer, calculateReward } from "../utils/algo";
import { acquireMutex } from "../utils/mutex";
import { calculateRevealPoints } from "../utils/points";
import { getQuestionState, isEntityRevealable } from "../utils/question";
import { CONNECTION } from "../utils/solana";
import { getJwtPayload } from "./jwt";
import { createUsedGenesisNft, getUsedGenesisNfts } from "./used-nft-genesis";

const checkNft = async (nftAddress: string) => {
  const usedGenesisNftIds = (await getUsedGenesisNfts()).map(
    (usedGenesisNft) => usedGenesisNft.nftId,
  );

  if (usedGenesisNftIds.includes(nftAddress)) {
    return false;
  }

  const asset = await dasUmi.rpc.getAsset(publicKey(nftAddress));

  const isEligible =
    asset.grouping.find(
      (group) =>
        group.group_key === COLLECTION_KEY &&
        group.group_value === GENESIS_COLLECTION_VALUE,
    ) && !asset.burnt;

  if (!isEligible) {
    return false;
  }

  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  await createUsedGenesisNft(nftAddress, payload.sub);

  return true;
};

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
) {
  const questions = await revealQuestions([questionId], burnTx, nftAddress);
  return questions ? questions[0] : null;
}

export async function revealDecks(
  deckIds: number[],
  burnTx?: string,
  nftAddress?: string,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const questionIds = await prisma.deckQuestion.findMany({
    where: {
      deckId: { in: deckIds },
      question: { chompResults: { none: { userId: payload.sub } } },
    },
    select: { questionId: true },
  });

  await revealQuestions(
    questionIds.map((q) => q.questionId),
    burnTx,
    nftAddress,
  );
  revalidatePath("/application");
}

export async function revealQuestions(
  questionIds: number[],
  burnTx?: string,
  nftAddress?: string,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const release = await acquireMutex({
    identifier: "REVEAL",
    data: { userId: payload.sub },
  });

  try {
    const questions = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      select: {
        id: true,
        revealAtDate: true,
        revealAtAnswerCount: true,
        revealTokenAmount: true,
        chompResults: {
          where: {
            userId: payload.sub,
            transactionStatus: TransactionStatus.Completed,
          },
          select: {
            id: true,
          },
        },
        questionOptions: {
          select: {
            questionAnswers: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    const revealableQuestions = questions.filter(
      (question) =>
        question.chompResults.length === 0 &&
        isEntityRevealable({
          revealAtDate: question.revealAtDate,
          revealAtAnswerCount: question.revealAtAnswerCount,
          answerCount: question.questionOptions[0].questionAnswers.length,
        }),
    );

    const bonkToBurn = revealableQuestions
      .slice(nftAddress && (await checkNft(nftAddress)) ? 1 : 0) // skip bonk burn for first question if nft is supplied
      .reduce((acc, cur) => acc + cur.revealTokenAmount, 0);

    const wallets = (
      await prisma.wallet.findMany({
        where: {
          userId: payload.sub,
        },
      })
    ).map((wallet) => wallet.address);

    if (bonkToBurn > 0) {
      if (!burnTx) {
        return null;
      }

      const burnTransactionCount = await prisma.chompResult.count({
        where: {
          burnTransactionSignature: burnTx,
          transactionStatus: TransactionStatus.Completed,
        },
      });

      if (burnTransactionCount > 0) {
        return null;
      }

      const transaction = await CONNECTION.getParsedTransaction(burnTx, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction || transaction.meta?.err) {
        return null;
      }

      const burnInstruction = transaction.transaction.message.instructions.find(
        (instruction) =>
          "parsed" in instruction &&
          +instruction.parsed.info.tokenAmount.amount >= bonkToBurn * 10 ** 5 &&
          instruction.parsed.type === "burnChecked" &&
          wallets.includes(instruction.parsed.info.authority) &&
          instruction.parsed.info.mint ===
            "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      );

      if (!burnInstruction) {
        return null;
      }
    }

    const decksOfQuestions = await prisma.deck.findMany({
      where: {
        deckQuestions: { some: { questionId: { in: questionIds } } },
        chompResults: { none: { userId: payload.sub } },
      },
      include: {
        deckQuestions: {
          include: {
            question: {
              include: {
                questionOptions: {
                  include: {
                    questionAnswers: { where: { userId: payload.sub } },
                  },
                },
                chompResults: { where: { userId: payload.sub } },
              },
            },
          },
        },
      },
    });

    const decksToAddRevealFor = decksOfQuestions.filter((deck) => {
      const questionStates = deck.deckQuestions.map((dq) => ({
        questionId: dq.questionId,
        state: getQuestionState(dq.question),
      }));

      const alreadyRevealed = questionStates
        .filter((qs) => qs.state.isRevealed)
        .map((qs) => qs.questionId);

      const newlyRevealed = questionStates
        .filter(
          (qs) =>
            revealableQuestions.some((rq) => rq.id === qs.questionId) &&
            !qs.state.isRevealed,
        )
        .map((qs) => qs.questionId);

      const revealedQuestions = [...alreadyRevealed, ...newlyRevealed];
      const allQuestionIds = deck.deckQuestions.map((dq) => dq.questionId);

      const remainingQuestions = allQuestionIds.filter(
        (qId) => !revealedQuestions.includes(qId),
      );

      return remainingQuestions.length === 0;
    });

    const uncalculatedQuestionOptionCount = await prisma.questionOption.count({
      where: {
        OR: [
          { calculatedIsCorrect: null },
          { calculatedAveragePercentage: null },
        ],
        questionId: {
          in: questionIds,
        },
      },
    });

    if (uncalculatedQuestionOptionCount > 0) {
      await calculateCorrectAnswer(revealableQuestions.map((q) => q.id));
    }

    const revealPoints = await calculateRevealPoints(
      payload.sub,
      questionIds.filter((questionId) => questionId !== null) as number[],
    );
    const pointsAmount = revealPoints.reduce((acc, cur) => acc + cur.amount, 0);

    const tokenAmount = await calculateReward(payload.sub, questionIds);

    await prisma.$transaction([
      prisma.chompResult.createMany({
        data: decksToAddRevealFor.map((deck) => ({
          deckId: deck.id,
          userId: payload.sub,
          result: ResultType.Revealed,
          burnTransactionSignature: burnTx,
          rewardTokenAmount: tokenAmount,
        })),
      }),
      prisma.chompResult.updateMany({
        data: {
          transactionStatus: TransactionStatus.Completed,
          rewardTokenAmount: tokenAmount,
        },
        where: {
          AND: {
            userId: payload.sub,
            questionId: {
              in: questionIds,
            },
            burnTransactionSignature: burnTx,
          },
        },
      }),
      prisma.fungibleAssetBalance.upsert({
        where: {
          asset_userId: {
            asset: FungibleAsset.Point,
            userId: payload.sub,
          },
        },
        update: {
          amount: {
            increment: pointsAmount,
          },
        },
        create: {
          userId: payload.sub,
          asset: FungibleAsset.Point,
          amount: pointsAmount,
        },
      }),
      prisma.fungibleAssetTransactionLog.createMany({
        data: revealPoints.map((revealPointsTx) => ({
          asset: FungibleAsset.Point,
          type: revealPointsTx.type,
          change: revealPointsTx.amount,
          userId: payload.sub,
        })),
      }),
    ]);

    release();
    revalidatePath("/application");
  } catch (e) {
    release();
    throw e;
  }
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

export async function createQuestionChompResult(
  questionId: number,
  burnTx: string,
) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  return prisma.chompResult.create({
    data: {
      userId: payload.sub,
      transactionStatus: TransactionStatus.Pending,
      questionId,
      result: ResultType.Revealed,
      burnTransactionSignature: burnTx,
    },
  });
}

export async function deleteQuestionChompResult(id: number) {
  await prisma.chompResult.delete({
    where: {
      id,
    },
  });
}

export async function getUsersPendingChompResult(questionId: number) {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  return prisma.chompResult.findFirst({
    where: {
      userId: payload.sub,
      questionId,
      transactionStatus: TransactionStatus.Pending,
    },
  });
}
