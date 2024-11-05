"use server";

import {
  DynamicJwtPayload,
  VerifiedEmail,
  VerifiedWallet,
  decodeJwtPayload,
} from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import prisma from "../services/prisma";
import { getRandomAvatarPath } from "../utils/avatar";
import { resetAccountData } from "./demo";

export const getJwtPayload = async () => {
  const token = cookies().get("token");

  if (!token) {
    return null;
  }

  const shouldOverrideUserId =
    process.env.OVERRIDE_USER_ID && process.env.OVERRIDE_USER_ID.length > 0;
  if (shouldOverrideUserId) {
    return { sub: process.env.OVERRIDE_USER_ID || "" } as DynamicJwtPayload;
  } else {
    return await decodeJwtPayload(token.value);
  }
};

export const setJwt = async (token: string, nextPath?: string | null) => {
  if (!token) {
    clearJwt();
    return;
  }

  const payload = await decodeJwtPayload(token);

  if (!payload || !payload.sub) {
    clearJwt();
    return;
  }

  const telegramUsername =
    payload.verified_credentials?.[1]?.format === "oauth"
      ? payload.verified_credentials?.[1]?.oauth_username
      : null;

  let user;

  if (telegramUsername) {
    // Check if any existing user has this Telegram username
    const existingTelegramUser = await prisma.user.findFirst({
      where: {
        telegramUsername: telegramUsername,
      },
      select: {
        id: true,
      },
    });

    // If we found a user with this Telegram username and their ID differs from the JWT payload,
    // update their ID to match the new JWT payload (effectively merging the accounts)
    if (existingTelegramUser && existingTelegramUser.id !== payload.sub) {
      user = await prisma.user.update({
        where: {
          id: existingTelegramUser.id,
        },
        data: {
          id: payload.sub,
        },
        include: {
          wallets: true,
          emails: true,
        },
      });
    } else {
      // If no existing user was found or the IDs match, create/update the user record
      user = await prisma.user.upsert({
        where: {
          id: payload.sub,
        },
        create: {
          id: payload.sub,
          profileSrc: getRandomAvatarPath(),
          telegramUsername: telegramUsername,
        },
        update: {},
        include: {
          wallets: true,
          emails: true,
        },
      });
    }
  } else {
    user = await prisma.user.upsert({
      where: {
        id: payload.sub,
      },
      create: {
        id: payload.sub,
        profileSrc: getRandomAvatarPath(),
        telegramUsername: telegramUsername,
      },
      update: {},
      include: {
        wallets: true,
        emails: true,
      },
    });
  }

  const walletAddresses = payload.verified_credentials
    .filter((vc) => vc.format === "blockchain" && vc.chain === "solana")
    .map((vc) => (vc as VerifiedWallet).address);

  const userWalletAddresses = user.wallets.map((wallet) => wallet.address);

  const walletsToCreate = walletAddresses.filter(
    (address) => !userWalletAddresses.includes(address),
  );

  if (walletsToCreate.length > 0) {
    await prisma.wallet.createMany({
      data: walletsToCreate.map((address) => ({
        address,
        userId: user.id,
      })),
    });
  }

  const walletsToDelete = userWalletAddresses.filter(
    (address) => !walletAddresses.includes(address),
  );

  if (walletsToDelete.length > 0) {
    await prisma.wallet.deleteMany({
      where: {
        address: {
          in: walletsToDelete,
        },
      },
    });
  }

  const emailAdresses = payload.verified_credentials
    .filter((vc) => vc.format === "email")
    .map((vc) => (vc as VerifiedEmail).email);

  const userEmailAddresses = user.emails.map((email) => email.address);

  const emailsToCreate = emailAdresses.filter(
    (address) => !userEmailAddresses.includes(address),
  );

  if (emailsToCreate.length > 0) {
    await prisma.email.createMany({
      data: emailsToCreate.map((address) => ({
        address,
        userId: user.id,
      })),
    });
  }

  const emailsToDelete = userEmailAddresses.filter(
    (address) => !emailAdresses.includes(address),
  );

  if (emailsToDelete.length > 0) {
    await prisma.email.deleteMany({
      where: {
        address: {
          in: emailsToDelete,
        },
      },
    });
  }

  cookies().set("token", token, {
    expires: payload.exp * 1000,
    secure: true,
    httpOnly: true,
  });

  const isDemo = process.env.ENVIRONMENT === "demo";
  if (isDemo) {
    await resetAccountData();
  }

  if (!!nextPath) redirect(nextPath);
};

export const clearJwt = () => {
  cookies().set("token", "", { expires: new Date(0) });

  redirect("/login");
};
