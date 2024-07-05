"use server";

import prisma from "../services/prisma";

export const getCampaignLeaderboard = async (
  campaignId: number,
  page: number = 1,
  pageSize: number = 10,
) => {
  const skip = (page - 1) * pageSize;

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
    skip: skip,
    take: pageSize,
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

  const leaderboardWithUsers = campaignLeaderboard.map((entry) => {
    const user = users.find((u) => u.id === entry.userId)!;
    return {
      user,
      points: entry._sum.points!,
    };
  });

  return leaderboardWithUsers;
};

export const getUserPointsInCampaign = async (
  userId: string,
  campaignId: number,
) => {
  const result = await prisma.dailyLeaderboard.groupBy({
    by: ["userId"],
    where: {
      campaignId: campaignId,
      userId,
    },
    _sum: {
      points: true,
    },
  });

  if (result.length === 0) {
    return 0;
  }

  const [user] = result;
  return user._sum.points ?? 0;
};
