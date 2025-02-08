"use server";

import { FungibleAsset, TransactionLogType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getIsUserAdmin } from "../queries/user";
import prisma from "../services/prisma";

export async function addCredits({
  wallets,
  credits,
}: {
  wallets: string[];
  credits: number;
}) {
  try {
    const isAdmin = await getIsUserAdmin();

    if (!isAdmin) {
      redirect("/application");
    }

    const walletsData = await prisma.wallet.findMany({
      where: {
        address: {
          in: wallets,
        },
      },
    });

    // Check if all wallets were found
    if (walletsData.length !== wallets.length) {
      const validAddresses = new Set(walletsData.map((w) => w.address));
      const notFound = wallets.filter((w) => !validAddresses.has(w));
      return {
        success: false,
        error: `Some wallet addresses were not found: ${notFound.join(", ")}`,
      };
    }

    await prisma.$transaction(
      walletsData.map((wallet) =>
        prisma.fungibleAssetTransactionLog.create({
          data: {
            change: credits,
            userId: wallet.userId,
            asset: FungibleAsset.Credit,
            type: TransactionLogType.CreditByAdmin,
          },
        }),
      ),
    );

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
