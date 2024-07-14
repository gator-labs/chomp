import { getTokenBalances } from "@/lib/web3";
import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

interface IBotUser {
  id: string,
  telegramId: string,
}

interface IEmailOrWallet {
  userId: string,
  address: string,
}

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

export async function getUserByTelegram(telegramId: string) {
  return await prisma.user.findFirst({
    where: {
      telegramId: telegramId,
    },
    include: {
      emails: true,
      wallets: true,
      questionAnswers: true 
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findFirst({
    where: {
      emails: {
        some: {
          address: email,
        },
      },
    },
    include: {
      emails: true,
      wallets: true,
      questionAnswers: true 
    },
  });
}

export async function setUserByTelegram(data: IBotUser
) {
  return await prisma.user.create({
    data,
    include: {
      emails: true,
      wallets: true,
      questionAnswers: true 
    },
  });
}

export async function updateUser(data: IBotUser, existingId: string) {
  return await prisma.user.update({
    where: {
      id: existingId,
    },
    data,
  });
}

export async function setWallet(data: IEmailOrWallet) {
  return await prisma.wallet.create({
    data,
  });
}

export async function setEmail(data: IEmailOrWallet) {
  return await prisma.email.create({
    data,
  });
}