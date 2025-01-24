"use server";

import { FungibleAsset, TransactionLogType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getIsUserAdmin } from "../queries/user";
import prisma from "../services/prisma";

export async function addCredits({
  wallet,
  credits,
}: {
  wallet: string;
  credits: number;
}) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const payload = await prisma.wallet.findUnique({
    where: {
      address: wallet,
    },
  });
  if (!payload) {
    throw new Error("Wallet not found");
  }

  await prisma.fungibleAssetTransactionLog.create({
    data: {
      change: credits,
      userId: payload?.userId,
      asset: FungibleAsset.Credit,
      type: TransactionLogType.CreditByAdmin,
    },
  });

  revalidatePath("/admin/users");
}
