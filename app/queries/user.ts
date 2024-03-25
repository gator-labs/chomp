import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";
import { getTokenBalances } from "@/lib/web3";

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
