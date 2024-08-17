"use server";

import {
  getDeckThatNeedChompResultBasedOnRevealedQuestionIds,
  handleFirstRevealToPopulateSubjectiveQuestion,
} from "@/app/actions/chompResult";
import { handleSendBonk } from "@/app/actions/claim";
import prisma from "@/app/services/prisma";
import { calculateReward } from "@/app/utils/algo";
import { ONE_MINUTE_IN_MILLISECONDS } from "@/app/utils/dateUtils";
import { acquireMutex } from "@/app/utils/mutex";
import { calculateRevealPoints } from "@/app/utils/points";
import { isEntityRevealable } from "@/app/utils/question";
import { FungibleAsset, ResultType, TransactionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { questionAnswerCountQuery } from "./questionAnswerCountQuery";

export async function revealAllSelected(
  questionIds: number[],
  userId: string,
  burnTx?: string,
) {
  const release = await acquireMutex({
    identifier: "REVEAL",
    data: { userId: userId },
  });

  try {
    await handleFirstRevealToPopulateSubjectiveQuestion(questionIds);
    const questionsFilteredForUser = await prisma.question.findMany({
      where: {
        id: { in: questionIds },
      },
      include: {
        chompResults: {
          where: {
            userId: userId,
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
      throw new Error("No revealable questions available");
    }

    const revealableQuestionIds = revealableQuestions.map((q) => q.id);
    const decksToAddRevealFor =
      await getDeckThatNeedChompResultBasedOnRevealedQuestionIds(
        revealableQuestionIds,
        userId,
      );

    const rewardsPerQuestionId = await calculateReward(
      userId,
      revealableQuestionIds,
    );

    const revealPoints = await calculateRevealPoints(
      Object.values(rewardsPerQuestionId!),
    );

    const pointsAmount = revealPoints.reduce((acc, cur) => acc + cur.amount, 0);

    await prisma.$transaction(async (tx) => {
      await tx.chompResult.deleteMany({
        where: {
          AND: {
            userId: userId,
            questionId: {
              in: revealableQuestionIds,
            },
            burnTransactionSignature: burnTx,
            transactionStatus: TransactionStatus.Pending,
          },
        },
      });

      await tx.chompResult.createMany({
        data: [
          ...revealableQuestionIds.map((questionId) => {
            const reward = rewardsPerQuestionId.find(
              (question) => question.questionId === questionId,
            );
            return {
              questionId,
              userId: userId,
              result: ResultType.Revealed,
              burnTransactionSignature: burnTx,
              rewardTokenAmount: reward ? reward.rewardAmount : undefined,
              transactionStatus: TransactionStatus.Completed,
            };
          }),
          ...decksToAddRevealFor.map((deck) => ({
            deckId: deck.id,
            userId: userId,
            result: ResultType.Revealed,
            burnTransactionSignature: burnTx,
          })),
        ],
      });

      await tx.fungibleAssetBalance.upsert({
        where: {
          asset_userId: {
            asset: FungibleAsset.Point,
            userId: userId,
          },
        },
        update: {
          amount: {
            increment: pointsAmount,
          },
        },
        create: {
          userId: userId,
          asset: FungibleAsset.Point,
          amount: pointsAmount,
        },
      });

      const campaignId = revealableQuestions[0].campaignId;

      if (!!campaignId) {
        const currentDate = new Date();

        await tx.dailyLeaderboard.upsert({
          where: {
            user_campaign_date: {
              userId: userId,
              campaignId: revealableQuestions[0].campaignId!,
              date: currentDate,
            },
          },
          create: {
            userId: userId,
            campaignId: revealableQuestions[0].campaignId,
            points: pointsAmount,
          },
          update: {
            points: { increment: pointsAmount },
          },
        });
      }

      await tx.fungibleAssetTransactionLog.createMany({
        data: revealPoints.map((revealPointsTx) => ({
          asset: FungibleAsset.Point,
          type: revealPointsTx.type,
          change: revealPointsTx.amount,
          userId: userId,
        })),
      });
    });

    release();
  } catch (e) {
    release();
    throw e;
  }
}

export async function claimAllSelected(
  questionIds: number[],
  userId: string,
  address: string,
) {
  const release = await acquireMutex({
    identifier: "CLAIM",
    data: { userId: userId },
  });

  try {
    const chompResults = await prisma.chompResult.findMany({
      where: {
        userId: userId,
        questionId: {
          in: questionIds,
        },
        result: ResultType.Revealed,
      },
    });
    const sendTx = await handleSendBonk(chompResults, address);

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

        const questionIdsClaimed = chompResults.map((cr) => cr.questionId ?? 0);
        // We're querying all data in transaction so we need claimed questions
        const decks = await tx.deck.findMany({
          where: {
            deckQuestions: {
              some: {
                questionId: {
                  in: questionIdsClaimed,
                },
              },
              every: {
                question: {
                  chompResults: {
                    every: {
                      userId: userId,
                      result: ResultType.Claimed,
                    },
                  },
                },
              },
            },
          },
          include: {
            chompResults: {
              where: {
                userId: userId,
              },
            },
          },
        });

        const deckRevealsToUpdate = decks
          .filter((deck) => deck.chompResults && deck.chompResults.length > 0)
          .map((deck) => deck.id);

        if (deckRevealsToUpdate.length > 0) {
          await tx.chompResult.updateMany({
            where: {
              deckId: { in: deckRevealsToUpdate },
            },
            data: {
              result: ResultType.Claimed,
              sendTransactionSignature: sendTx,
            },
          });
        }

        const deckRevealsToCreate = decks
          .filter(
            (deck) => !deck.chompResults || deck.chompResults.length === 0,
          )
          .map((deck) => deck.id);

        if (deckRevealsToCreate.length > 0) {
          await tx.chompResult.createMany({
            data: deckRevealsToCreate.map((deckId) => ({
              deckId,
              userId: userId,
              result: ResultType.Claimed,
              sendTransactionSignature: sendTx,
            })),
          });
        }
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );
    release();
    revalidatePath("/application");
    return { sendTx, chompResults };
  } catch (e) {
    console.log("Error while claiming question", e);
    release();
    throw e;
  }
}
