"use server";

import { VerifiedEmail, VerifiedWallet, decodeJwtPayload } from "@/lib/auth";
import { cookies } from "next/headers";
import prisma from "../services/prisma";
import { redirect } from "next/navigation";

export const getJwtPayload = async () => {
  const token = cookies().get("token");

  if (!token) {
    return null;
  }

  return await decodeJwtPayload(token.value);
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

  const user = await prisma.user.upsert({
    where: {
      id: payload.sub,
    },
    create: {
      id: payload.sub,
    },
    update: {},
    include: {
      wallets: true,
      emails: true,
    },
  });

  const walletAddresses = payload.verified_credentials
    .filter((vc) => vc.format === "blockchain" && vc.chain === "solana")
    .map((vc) => (vc as VerifiedWallet).address);

  const userWalletAddresses = user.wallets.map((wallet) => wallet.address);

  const walletsToCreate = walletAddresses.filter(
    (address) => !userWalletAddresses.includes(address)
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
    (address) => !walletAddresses.includes(address)
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
    (address) => !userEmailAddresses.includes(address)
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
    (address) => !emailAdresses.includes(address)
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

  redirect(nextPath ?? "/application");
};

export const clearJwt = () => {
  cookies().set("token", "", { expires: new Date(0) });

  redirect("/login");
};
