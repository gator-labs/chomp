"use server";

import { FungibleAsset, ResultType } from "@prisma/client";
import {
  getNumberOfChompedQuestionsOfCampaignQuery,
  getNumberOfChompedQuestionsQuery,
} from "../queries/leaderboard";
import { getCurrentUser } from "../queries/user";
import prisma from "../services/prisma";
import { getStartAndEndOfDay, getWeekStartAndEndDates } from "../utils/date";

interface LeaderboardProps {
  variant: "weekly" | "daily" | "campaign";
  filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions";
  campaignId?: number;
}

export const getLeaderboard = async ({
  filter,
  variant,
  campaignId,
}: LeaderboardProps) => {
  const dateFilter = variant === "campaign" ? {} : getDateFilter(variant)!;

  if (filter === "totalPoints") return getTotalPoints(dateFilter, campaignId);

  if (filter === "totalBonkClaimed")
    return getTotalBonkClaimed(dateFilter, campaignId);

  if (filter === "chompedQuestions")
    return getNumberOfChompedQuestions(dateFilter, campaignId);
};

const getNumberOfChompedQuestions = async (
  dateFilter:
    | {
        createdAt: {
          gte: Date;
          lte: Date;
        };
      }
    | {},
  campaignId?: number,
) => {
  const gte = (
    dateFilter as {
      createdAt: {
        gte: Date;
        lte: Date;
      };
    }
  )?.createdAt?.gte;

  const lte = (
    dateFilter as {
      createdAt: {
        gte: Date;
        lte: Date;
      };
    }
  )?.createdAt?.lte;

  const res = await (!!campaignId
    ? getNumberOfChompedQuestionsOfCampaignQuery(campaignId)
    : getNumberOfChompedQuestionsQuery(gte, lte));

  const leaderboard = res.map((item: any) => ({
    userId: item.userId,
    value: item.questionsAnswered,
  }));

  const userIds = res.map((entry: any) => entry.userId);
  return mapLeaderboardData(leaderboard, userIds);
};

const getTotalPoints = async (dateFilter = {}, campaignId?: number) => {
  const whereCampaignClause = !!campaignId
    ? { OR: [{ question: { campaignId } }, { deck: { campaignId } }] }
    : {};

  const data = await prisma.fungibleAssetTransactionLog.groupBy({
    by: ["userId"],
    where: {
      asset: FungibleAsset.Point,
      ...whereCampaignClause,
      ...dateFilter,
      change: {
        gt: 0,
      },
    },
    _sum: {
      change: true,
    },
    orderBy: {
      _sum: {
        change: "desc",
      },
    },
  });

  const leaderboard = data.map((item) => ({
    userId: item.userId,
    value: Math.round(item._sum.change!.toNumber()),
  }));

  const userIds = data.map((entry) => entry.userId);
  return mapLeaderboardData(leaderboard, userIds);
};

const getTotalBonkClaimed = async (dateFilter = {}, campaignId?: number) => {
  const whereCampaignClause = !!campaignId ? { question: { campaignId } } : {};

  const res = await prisma.chompResult.groupBy({
    by: ["userId"],
    where: {
      rewardTokenAmount: {
        gt: 0,
      },
      result: ResultType.Claimed,
      ...whereCampaignClause,
      ...dateFilter,
    },
    _sum: {
      rewardTokenAmount: true,
    },
    orderBy: {
      _sum: {
        rewardTokenAmount: "desc",
      },
    },
  });

  const leaderboard = res.map((item) => ({
    userId: item.userId,
    value: Math.round(item._sum.rewardTokenAmount!.toNumber()),
  }));

  const userIds = res.map((entry) => entry.userId);
  return mapLeaderboardData(leaderboard, userIds);
};

const mapLeaderboardData = async (
  leaderboard: { userId: string; value: number }[],
  userIds: string[],
) => {
  const loggedInUser = await getCurrentUser();

  const users = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    include: {
      wallets: true,
    },
  });

  let rank = 0;
  let loggedInUserRank: number | undefined;
  let loggedInUserPoints: number | undefined;

  const ranking = [];
  for (let index = 0; index < leaderboard.length; index++) {
    const entry = leaderboard[index];
    const user = users.find((u) => u.id === entry.userId)!;

    if (entry.value !== leaderboard[index - 1]?.value) rank = rank + 1;

    if (rank > 100) {
      break;
    }

    if (user!.id === loggedInUser?.id) {
      loggedInUserRank = rank;
      loggedInUserPoints = entry.value;
    }

    ranking.push({
      user,
      value: entry.value,
      rank,
    });
  }

  return {
    ranking,
    loggedInUserScore: {
      loggedInUserRank,
      loggedInUserPoints,
    },
  };
};

const getDateFilter = (variant: "weekly" | "daily", previous?: boolean) => {
  if (variant === "weekly") {
    const { startDateOfTheWeek, endDateOfTheWeek } = getWeekStartAndEndDates(
      new Date(),
    );

    return {
      createdAt: {
        gte: startDateOfTheWeek,
        lte: endDateOfTheWeek,
      },
    };
  }

  if (variant === "daily") {
    const { startOfTheDay, endOfTheDay } = getStartAndEndOfDay();

    return {
      createdAt: {
        gte: startOfTheDay,
        lte: endOfTheDay,
      },
    };
  }
};
