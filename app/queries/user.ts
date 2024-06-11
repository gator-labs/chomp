import { getTokenBalances } from "@/lib/web3";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

export const getUserTokenBalances = async () => {
  const payload = await getJwtPayload();

  if (!payload) {
    return { bonk: 0 };
  }

  const wallets = await prisma.wallet.findMany({
    where: {
      userId: payload.sub,
    },
  });

  return await getTokenBalances(wallets.map((wallet) => wallet.address));
};

export async function getIsUserAdmin() {
  const payload = await getJwtPayload();

  if (!payload) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!user) {
    return false;
  }

  return user.isAdmin;
}

export async function getCurrentUser() {
  const payload = await getJwtPayload();

  return prisma.user.findUnique({
    where: {
      id: payload?.sub,
    },
  });
}

export async function addUserTutorialTimestamp() {
  const payload = await getJwtPayload();

  await prisma.user.update({
    where: {
      id: payload!.sub,
    },
    data: {
      tutorialCompletedAt: new Date(),
    },
  });
}
