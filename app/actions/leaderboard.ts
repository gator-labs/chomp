"use server";

import { kv } from "@/lib/kv";
import { FungibleAsset, ResultType } from "@prisma/client";
import {
  differenceInSeconds,
  isSameDay,
  isWithinInterval,
  subDays,
} from "date-fns";
import { Prisma } from "@prisma/client";

import { Ranking } from "../components/Leaderboard/Leaderboard";
import {
  getAllTimeChompedQuestionsQuery,
  getNumberOfChompedQuestionsOfStackQuery,
  getNumberOfChompedQuestionsQuery,
} from "../queries/leaderboard";
import { getCurrentUser } from "../queries/user";
import prisma from "../services/prisma";
import { getStartAndEndOfDay, getWeekStartAndEndDates } from "../utils/date";

interface LeaderboardProps {
  variant: "weekly" | "daily" | "stack" | "all-time";
  filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions";
  stackId?: number;
}

export const getPreviousUserRank = async (
  variant: "weekly" | "daily",
  filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions",
) => {
  const today = new Date();
  const startDateLeaderboard = new Date(Date.UTC(2024, 6, 16, 0, 0, 0, 0)); // July 16, 2024 00:00:00 UTC
  const endDateLeaderboard = new Date(Date.UTC(2024, 6, 21, 23, 59, 59, 999)); // July 21, 2024 23:59:59.999 UTC

  if (
    (variant === "weekly" &&
      isWithinInterval(today, {
        start: startDateLeaderboard,
        end: endDateLeaderboard,
      })) ||
    (variant === "daily" && isSameDay(today, startDateLeaderboard))
  )
    return;

  const currentUser = await getCurrentUser();

  const dateRange = getDateRange(variant, true);
  const { endDate: expirationDate } = getDateRange(variant)!;

  const dateFilter = {
    createdAt: {
      gte: dateRange!.startDate,
      lte: dateRange!.endDate,
    },
  };

  const key = `${variant}-${filter}`;

  if (filter === "totalPoints") {
    const cachedRanking = (await kv.get(key)) as Ranking[] | null;

    if (!!cachedRanking) {
      return cachedRanking.find(
        (ranking) => ranking.user.id === currentUser?.id,
      )?.rank;
    }

    const totalPoints = await getLeaderboardPointsStats(dateFilter);

    const expirationInSeconds = Math.abs(
      differenceInSeconds(new Date(), expirationDate),
    );

    await kv.set(key, JSON.stringify(totalPoints.ranking), {
      ex: expirationInSeconds,
    });

    return totalPoints.ranking.find(
      (ranking) => ranking.user.id === currentUser?.id,
    )?.rank;
  }

  if (filter === "totalBonkClaimed") {
    const cachedRanking = (await kv.get(key)) as Ranking[] | null;

    if (!!cachedRanking) {
      return cachedRanking.find(
        (ranking) => ranking.user.id === currentUser?.id,
      )?.rank;
    }

    const totalBonkClaimed = await getTotalBonkClaimed(dateFilter);

    const expirationInSeconds = Math.abs(
      differenceInSeconds(new Date(), expirationDate),
    );

    await kv.set(key, JSON.stringify(totalBonkClaimed.ranking), {
      ex: expirationInSeconds,
    });

    return totalBonkClaimed.ranking.find(
      (ranking) => ranking.user.id === currentUser?.id,
    )?.rank;
  }

  if (filter === "chompedQuestions") {
    const cachedRanking = (await kv.get(key)) as Ranking[] | null;

    if (!!cachedRanking) {
      return cachedRanking.find(
        (ranking) => ranking.user.id === currentUser?.id,
      )?.rank;
    }

    const chompedQuestions = await getNumberOfChompedQuestions(dateFilter);

    const expirationInSeconds = Math.abs(
      differenceInSeconds(new Date(), expirationDate),
    );

    await kv.set(key, JSON.stringify(chompedQuestions.ranking), {
      ex: expirationInSeconds,
    });

    return chompedQuestions.ranking.find(
      (ranking) => ranking.user.id === currentUser?.id,
    )?.rank;
  }
};

export const getLeaderboard = async ({
  filter,
  variant,
  stackId,
}: LeaderboardProps) => {
  console.log("getLeaderboard", filter, variant, stackId);
  let dateFilter = {};

  if (variant !== "stack" && variant !== "all-time") {
    const dateRange = getDateRange(variant);
    dateFilter = {
      createdAt: {
        gte: dateRange!.startDate,
        lte: dateRange!.endDate,
      },
    };
  }

  if (filter === "totalPoints")
    return getLeaderboardPointsStats(dateFilter, stackId);

  if (filter === "totalBonkClaimed")
    return getTotalBonkClaimed(dateFilter, stackId);

  if (filter === "chompedQuestions")
    return getNumberOfChompedQuestions(dateFilter, stackId);
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
  stackId?: number,
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

  const res = await (!!stackId
    ? getNumberOfChompedQuestionsOfStackQuery(stackId)
    : Object.keys(dateFilter).length === 0
      ? getAllTimeChompedQuestionsQuery()
      : getNumberOfChompedQuestionsQuery(gte, lte));

  const leaderboard = res.map((item: any) => ({
    userId: item.userId,
    value: item.questionsAnswered,
  }));

  const userIds = res.map((entry: any) => entry.userId);
  return mapLeaderboardData(leaderboard, userIds);
};

export const getLeaderboardPointsStats = async (
  dateFilter = {},
  stackId?: number,
) => {
  const whereStackClause = !!stackId
    ? {
        OR: [{ question: { stackId } }, { deck: { stackId } }],
      }
    : {};

  const data = await prisma.fungibleAssetTransactionLog.groupBy({
    by: ["userId"],
    where: {
      asset: FungibleAsset.Point,
      ...whereStackClause,
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

export const getTotalBonkClaimed = async (dateFilter = {}, stackId?: number, allowedUserIds?: string[]) => {
  const whereStackClauseChomp = !!stackId ? { question: { stackId } } : {};

  const chompWhere: Prisma.ChompResultWhereInput = {
    rewardTokenAmount: {
      gt: 0,
    },
    result: ResultType.Claimed,
    ...whereStackClauseChomp,
    ...dateFilter,
  };

  if (allowedUserIds) {
    chompWhere.userId = { in: allowedUserIds };
  }

  const chompResults = await prisma.chompResult.groupBy({
    by: ["userId"],
    where: chompWhere,
    _sum: {
      rewardTokenAmount: true,
    },
  });

  const mysteryBoxWhereConditions: Prisma.MysteryBoxPrizeWhereInput = {
    prizeType: "Token",
    status: "Claimed",
    tokenAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    amount: { not: "0" },
  };

  if (stackId) {
    mysteryBoxWhereConditions.mysteryBoxTrigger = {
      OR: [
        { question: { stackId } },
        { deck: { stackId } },
      ],
    };
  }

  if (dateFilter && (dateFilter as any).createdAt) {
    mysteryBoxWhereConditions.claimedAt = (dateFilter as any).createdAt;
  }

  if (allowedUserIds) {
    const userFilterForMysteryBox = { userId: { in: allowedUserIds } };
    
    if (mysteryBoxWhereConditions.mysteryBoxTrigger) {
      const existingTriggerFilter = mysteryBoxWhereConditions.mysteryBoxTrigger as Prisma.MysteryBoxTriggerWhereInput;
      
      mysteryBoxWhereConditions.mysteryBoxTrigger = {
        AND: [
          existingTriggerFilter,
          { MysteryBox: userFilterForMysteryBox }
        ]
      } as any;
    } else {
      mysteryBoxWhereConditions.mysteryBoxTrigger = { MysteryBox: userFilterForMysteryBox } as any;
    }
  }

  const mysteryBoxPrizes = await prisma.mysteryBoxPrize.findMany({
    where: mysteryBoxWhereConditions,
    select: {
      amount: true,
      mysteryBoxTrigger: {
        select: {
          MysteryBox: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });

  const combinedLeaderboardMap = new Map<string, number>();

  chompResults.forEach((item) => {
    const currentAmount = combinedLeaderboardMap.get(item.userId) || 0;
    combinedLeaderboardMap.set(
      item.userId,
      currentAmount + Math.round(item._sum.rewardTokenAmount!.toNumber()),
    );
  });

  mysteryBoxPrizes.forEach((prize) => {
    if (prize.mysteryBoxTrigger?.MysteryBox?.userId) {
      const userId = prize.mysteryBoxTrigger.MysteryBox.userId;
      const prizeAmount = parseFloat(prize.amount);
      if (!isNaN(prizeAmount) && prizeAmount > 0) {
        const currentAmount = combinedLeaderboardMap.get(userId) || 0;
        combinedLeaderboardMap.set(userId, currentAmount + prizeAmount);
      }
    }
  });
  
  const leaderboard = Array.from(combinedLeaderboardMap.entries())
    .map(([userId, value]) => ({
      userId,
      value: Math.round(value),
    }))
    .sort((a, b) => b.value - a.value);

  const userIds = leaderboard.map((entry) => entry.userId);
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

    if (!user) {
      continue;
    }

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

const getDateRange = (variant: "weekly" | "daily", previous?: boolean) => {
  if (variant === "weekly") {
    const { startDateOfTheWeek, endDateOfTheWeek } = getWeekStartAndEndDates(
      subDays(new Date(), previous ? 7 : 0),
    );

    return {
      startDate: startDateOfTheWeek,
      endDate: endDateOfTheWeek,
    };
  }

  if (variant === "daily") {
    const { startOfTheDay, endOfTheDay } = getStartAndEndOfDay(
      subDays(new Date(), previous ? 1 : 0),
    );

    return {
      startDate: startOfTheDay,
      endDate: endOfTheDay,
    };
  }
};
