"use server";

import prisma from "../services/prisma";

const MAX_RANK_NUMBER = 100;

export const getCampaignLeaderboard = async (
  campaignId: number,
  loggedInUserId: string,
) => {
  const campaignLeaderboard = await prisma.dailyLeaderboard.groupBy({
    by: ["userId"],
    where: {
      campaignId: campaignId,
    },
    _sum: {
      points: true,
    },
    having: {
      points: {
        _sum: {
          gt: 0,
        },
      },
    },
    orderBy: {
      _sum: {
        points: "desc",
      },
    },
  });

  // TODO: optimize this later
  const userIds = campaignLeaderboard.map((entry) => entry.userId);

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

  const ranking = campaignLeaderboard.map((entry, index) => {
    const user = users.find((u) => u.id === entry.userId)!;

    if (entry._sum.points !== campaignLeaderboard[index - 1]?._sum.points)
      rank = rank + 1;

    if (rank > MAX_RANK_NUMBER) return;

    if (user.id === loggedInUserId) {
      loggedInUserRank = rank;
      loggedInUserPoints = entry._sum.points!;
    }

    return {
      user,
      points: entry._sum.points!,
      rank,
    };
  });

  return {
    ranking,
    loggedInUserScore: {
      loggedInUserRank,
      loggedInUserPoints,
    },
  };
};
