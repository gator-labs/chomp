"use server";

import { FungibleAsset, ResultType } from "@prisma/client";

import { kv } from "@/lib/kv";
import { differenceInSeconds, subDays } from "date-fns";
import { Ranking } from "../components/Leaderboard/Leaderboard";
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

export const getPreviousUserRank = async (
  variant: "weekly" | "daily",
  filter: "totalPoints" | "totalBonkClaimed" | "chompedQuestions",
) => {
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

    console.log({ cachedRanking });

    if (!!cachedRanking) {
      return cachedRanking.find(
        (ranking) => ranking.user.id === currentUser?.id,
      )?.rank;
    }

    const totalPoints = await getTotalPoints(dateFilter);

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
  campaignId,
}: LeaderboardProps) => {
  let dateFilter = {};

  if (variant !== "campaign") {
    const dateRange = getDateRange(variant);
    console.log(dateRange);
    dateFilter = {
      createdAt: {
        gte: dateRange!.startDate,
        lte: dateRange!.endDate,
      },
    };
  }

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

const getDateRange = (variant: "weekly" | "daily", previous?: boolean) => {
  console.log({ variant });
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
