"use server";

import {
  CreateMysteryBoxError,
  GetUnopenedMysteryBoxError,
  OpenMysteryBoxError,
} from "@/lib/error";
import { sendBonkFromTreasury } from "@/lib/mysteryBox";
import { EMysteryBoxCategory } from "@/types/mysteryBox";
import {
  EBoxPrizeStatus,
  EBoxPrizeType,
  EBoxTriggerType,
  EMysteryBoxStatus,
  EPrizeSize,
  FungibleAsset,
  TransactionLogType,
} from "@prisma/client";
import * as Sentry from "@sentry/nextjs";

import { getJwtPayload } from "../actions/jwt";
import { SENTRY_FLUSH_WAIT } from "../constants/sentry";
import prisma from "../services/prisma";
import { calculateMysteryBoxHubReward } from "../utils/algo";
import { authGuard } from "../utils/auth";
import { ONE_MINUTE_IN_MILLISECONDS } from "../utils/dateUtils";
import { acquireMutex } from "../utils/mutex";
import { filterQuestionsByMinimalNumberOfAnswers } from "../utils/question";

/**
 * Get an unopened mystery box for a user
 *
 * @returns The mystery box ID or null if no mystery box is found.
 */
export const getUnopenedMysteryBox = async (
  triggerType: EBoxTriggerType[],
): Promise<string | null> => {
  const payload = await authGuard();

  try {
    const mysteryBox = await prisma.mysteryBox.findFirst({
      where: {
        userId: payload.sub,
        status: EMysteryBoxStatus.Unopened,
        triggers: { some: { triggerType: { in: triggerType } } },
      },
      include: {
        MysteryBoxPrize: {
          where: {
            // We check for Unclaimed/Dismissed status here since boxes may be stuck in
            // Unclaimed state if a previous reveal attempt failed
            status: {
              in: [EBoxPrizeStatus.Dismissed, EBoxPrizeStatus.Unclaimed],
            },
          },
        },
      },
    });

    return mysteryBox?.id ?? null;
  } catch (error) {
    const getUnopenedMysteryBoxError = new GetUnopenedMysteryBoxError(
      `Error getting unopened mystery box for user id: ${payload.sub}`,
      { cause: error },
    );
    Sentry.captureException(getUnopenedMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }
};

/**
 * Retrieves the mystery box ID for a new user if they are eligible.
 *
 * This function checks if the user is new and if they have completed the tutorial.
 * If the user is new and has not yet triggered the tutorial completion mystery box,
 * it rewards them with a mystery box and returns its ID.
 *
 * @returns {Promise<string | null>} The ID of the rewarded mystery box if the user is eligible, otherwise null.
 */
export const getNewUserMysteryBoxId = async (): Promise<string | null> => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }
  const userId = payload.sub;
  const isNewUser = payload?.new_user;
  const res = await prisma.mysteryBox.findFirst({
    where: {
      userId,
      triggers: { some: { triggerType: EBoxTriggerType.TutorialCompleted } },
    },
  });

  const FF_MYSTERY_BOX = Boolean(
    process.env.NEXT_PUBLIC_FF_MYSTERY_BOX_NEW_USER === "true",
  );

  const isEligible = Boolean(isNewUser && !res && FF_MYSTERY_BOX);
  if (isEligible) {
    const mysteryBoxId = await rewardTutorialMysteryBox(userId);
    return mysteryBoxId;
  }
  return null;
};

/**
 * Rewards a user with a tutorial completion mystery box.
 *
 * @param userId - The ID of the user to reward.
 * @returns A promise that resolves to the ID of the created mystery box, or null if the user wallet is not found or an error occurs.
 *
 * @throws {CreateMysteryBoxError} If there is an error creating the mystery box.
 */
async function rewardTutorialMysteryBox(
  userId: string,
): Promise<string | null> {
  try {
    // const calculatedReward = await calculateMysteryBoxReward(
    //   MysteryBoxEventsType.TUTORIAL_COMPLETED,
    // );

    // console.log(calculatedReward);

    const calculatedRewardWip = {
      box_type: EPrizeSize.Small,
      credit: 15,
    };

    // if (!calculatedReward?.bonk) throw new Error("No BONK in mystery box");

    const userWallet = await prisma.wallet.findFirst({ where: { userId } });

    if (!userWallet) return null;

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          create: {
            triggerType: EBoxTriggerType.TutorialCompleted,
          },
        },
        MysteryBoxPrize: {
          create: {
            status: EBoxPrizeStatus.Unclaimed,
            size: calculatedRewardWip.box_type,
            prizeType: EBoxPrizeType.Credits,
            amount: String(calculatedRewardWip?.credit),
          },
        },
      },
    });
    return res.id;
  } catch (e) {
    const createMysteryBoxError = new CreateMysteryBoxError(
      `Trouble creating tutorail completion mystery box for User id: ${userId}`,
      { cause: e },
    );
    Sentry.captureException(createMysteryBoxError);
    await Sentry.flush(SENTRY_FLUSH_WAIT);
    return null;
  }
}

/**
 * Retrieves validation reward questions for the authenticated user.
 *
 * This function fetches the JWT payload to identify the user and then queries the database
 * to get a list of questions that meet specific criteria for validation rewards.
 *
 * @returns {Promise<{ id: number; answerCount: number; question: string; }[] | null>}
 *          A promise that resolves to an array of questions with their IDs, answer counts,
 *          and question texts, or null if the payload is not available.
 *
 * The questions are filtered based on the following conditions:
 * - The question has a reveal date that is in the past.
 * - The question has a minium number of answers. (See filterQuestionsByMinimalNumberOfAnswers)
 * - The user has not already triggered a validation reward for the question.
 * - The user has selected an answer for the question, and the answer is either correct or has a calculated average percentage.
 * - The user has been charged for the question as a premium question.
 */
export const getValidationRewardQuestions = async () => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const questions = await prisma.$queryRaw<
    {
      id: number;
      answerCount: number;
      question: string;
    }[]
  >`
SELECT 
    q.id,
    q.question,
    (
        SELECT COUNT(DISTINCT CONCAT(qa."userId", qo."questionId"))
        FROM public."QuestionOption" qo
        JOIN public."QuestionAnswer" qa ON qa."questionOptionId" = qo."id"
        WHERE qo."questionId" = q."id"
    ) AS "answerCount"
FROM 
    public."Question" q
JOIN 
    public."FungibleAssetTransactionLog" fatl ON q.id = fatl."questionId"
WHERE 
    q."revealAtDate" IS NOT NULL
    AND q."revealAtDate" < NOW()
    AND NOT EXISTS (
        SELECT 1
        FROM public."MysteryBox" mb
        JOIN public."MysteryBoxTrigger" mbt ON mbt."mysteryBoxId" = mb.id
        WHERE mbt."questionId" = q.id
        AND mbt."triggerType" = 'ValidationReward'
        AND mb."status" = 'Opened'
        AND mb."userId" = ${userId}
    )
    AND EXISTS (
        SELECT 1
        FROM public."QuestionOption" qo
        JOIN public."QuestionAnswer" qa ON qo.id = qa."questionOptionId"
        WHERE 
            qo."questionId" = q.id
            AND qa.selected = TRUE
            AND (qo."calculatedIsCorrect" IS NOT NULL OR qo."calculatedAveragePercentage" IS NOT NULL)
            AND qa."userId" = ${userId}
    )
    AND fatl."userId" = ${userId}
    AND fatl."change" = -q."creditCostPerQuestion"
    AND fatl."type" = 'PremiumQuestionCharge'
    AND fatl."change" < 0;
	`;

  return filterQuestionsByMinimalNumberOfAnswers(questions);
};

export const rewardMysteryBoxHub = async ({}: {
  type: EMysteryBoxCategory;
}) => {
  const payload = await getJwtPayload();
  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const userWallet = await prisma.wallet.findFirst({ where: { userId } });

  if (!userWallet) return null;

  const revealableQuestions = await getValidationRewardQuestions();

  if (!revealableQuestions?.length) {
    throw new Error("No revealable questions found");
  }

  const questionIds = revealableQuestions.map((rq) => rq.id);

  const existingTriggers = await prisma.mysteryBoxTrigger.findMany({
    where: {
      questionId: { in: questionIds },
      triggerType: EBoxTriggerType.ValidationReward,
    },
  });

  const existingQuestionIds = existingTriggers.map(
    (trigger) => trigger.questionId,
  );
  const existingMysteryBoxIds = existingTriggers.map(
    (trigger) => trigger.mysteryBoxId,
  );

  const newQuestionIds = questionIds.filter(
    (id) => !existingQuestionIds.includes(id),
  );
  if (newQuestionIds.length > 0) {
    const rewards = await calculateMysteryBoxHubReward(userId, questionIds);
    if (rewards?.length !== newQuestionIds.length) {
      return null;
    }

    const tokenAddress = process.env.NEXT_PUBLIC_BONK_ADDRESS ?? "";

    const prizes = rewards.flatMap((item) => [
      {
        prizeType: EBoxPrizeType.Credits,
        size: EPrizeSize.Hub,
        amount: item.creditRewardAmount.toString(),
      },
      {
        prizeType: EBoxPrizeType.Token,
        amount: item.bonkRewardAmount.toString(),
        size: EPrizeSize.Hub,
        tokenAddress: tokenAddress, // Add the bonk address here
      },
    ]);

    const res = await prisma.mysteryBox.create({
      data: {
        userId,
        triggers: {
          createMany: {
            data: newQuestionIds.map((questionId) => ({
              questionId: questionId,
              triggerType: EBoxTriggerType.ValidationReward,
              mysteryBoxAllowlistId: null,
            })),
          },
        },
        MysteryBoxPrize: {
          createMany: { data: prizes },
        },
      },
    });

    const newMysteryBoxId = res.id;
    return [...existingMysteryBoxIds, newMysteryBoxId];
  }

  return existingMysteryBoxIds;
};

export const openMysteryBoxHub = async (mysteryBoxIds: string[]) => {
  const payload = await getJwtPayload();

  if (!payload) {
    return null;
  }

  const userId = payload.sub;

  const release = await acquireMutex({
    identifier: "OPEN_MYSTERY_BOX_HUB",
    data: { userId: payload.sub },
  });

  const userWallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  if (!userWallet) {
    release();
    return null;
  }

  let rewards;

  try {
    rewards = await prisma.mysteryBox.findMany({
      where: {
        id: {
          in: mysteryBoxIds,
        },
        userId,
        status: EMysteryBoxStatus.New,
      },
      include: {
        MysteryBoxPrize: {
          select: {
            id: true,
            prizeType: true,
            amount: true,
            tokenAddress: true,
          },
          where: {
            prizeType: {
              in: [EBoxPrizeType.Token, EBoxPrizeType.Credits],
            },
          },
        },
      },
    });
  } catch (e) {
    release();

    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet.address}) is having trouble claiming for Mystery Box Hub with mysteryboxIds ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);
    throw new Error("Error opening mystery box");
  }

  if (!rewards) {
    release();
    throw new Error("Reward not found or not in openable state");
  }

  let totalBonkAmount = 0;
  let totalCreditAmount = 0;

  try {
    const allPrizes = rewards.flatMap((item) => item.MysteryBoxPrize);
    const tokenPrizes = allPrizes.filter(
      (prize) => prize.prizeType === EBoxPrizeType.Token,
    );
    const creditPrizes = allPrizes.filter(
      (prize) => prize.prizeType === EBoxPrizeType.Credits,
    );

    totalBonkAmount = tokenPrizes.reduce(
      (acc, prize) => acc + parseFloat(prize.amount),
      0,
    );

    totalCreditAmount = creditPrizes.reduce(
      (acc, prize) => acc + parseFloat(prize.amount),
      0,
    );
    let txHash = null;
    if (totalBonkAmount > 0) {
      txHash = await sendBonkFromTreasury(totalBonkAmount, userWallet.address);
      if (!txHash) {
        release();
        throw new Error("Tx failed");
      }
    }

    await prisma.$transaction(
      async (tx) => {
        await tx.fungibleAssetTransactionLog.createMany({
          data: creditPrizes.map((prize) => ({
            type: TransactionLogType.MysteryBox,
            asset: FungibleAsset.Credit,
            change: prize?.amount,
            userId: payload.sub,
            mysteryBoxPrizeId: prize.id,
          })),
        });

        await tx.mysteryBoxPrize.updateMany({
          where: {
            id: {
              in: tokenPrizes.map((item) => item.id),
            },
          },
          data: {
            status: EBoxPrizeStatus.Claimed,
            claimHash: txHash,
            claimedAt: new Date(),
          },
        });

        await tx.mysteryBoxPrize.updateMany({
          where: {
            id: {
              in: creditPrizes.map((item) => item.id),
            },
          },
          data: {
            status: EBoxPrizeStatus.Claimed,
            claimedAt: new Date(),
          },
        });

        await tx.mysteryBox.updateMany({
          where: {
            id: {
              in: mysteryBoxIds,
            },
          },
          data: {
            status: EMysteryBoxStatus.Opened,
          },
        });
      },
      {
        isolationLevel: "Serializable",
        timeout: ONE_MINUTE_IN_MILLISECONDS,
      },
    );

    release();
  } catch (e) {
    await prisma.mysteryBox.updateMany({
      where: {
        id: {
          in: mysteryBoxIds,
        },
      },
      data: {
        status: EMysteryBoxStatus.Unopened,
      },
    });

    await prisma.mysteryBoxPrize.updateMany({
      where: {
        id: {
          in: rewards
            .flatMap((item) => item.MysteryBoxPrize)
            .map((item) => item.id),
        },
      },
      data: {
        status: EBoxPrizeStatus.Unclaimed,
      },
    });

    Sentry.captureException(e);
    const openMysteryBoxError = new OpenMysteryBoxError(
      `User with id: ${payload.sub} (wallet: ${userWallet}) is having trouble claiming for Mystery Box: ${mysteryBoxIds}`,
      { cause: e },
    );
    Sentry.captureException(openMysteryBoxError);

    throw new Error("Error opening mystery box");
  } finally {
    release();
    await Sentry.flush(SENTRY_FLUSH_WAIT);
  }

  return {
    totalCreditAmount,
    totalBonkAmount,
  };
};
