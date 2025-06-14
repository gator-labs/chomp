"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { CONNECTION } from "@/app/utils/solana";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const hasBonkAtaAccount = async () => {
  const payload = await getJwtPayload();

  // If no authentication, user doesn't have BONK ATA account
  if (!payload) {
    return false;
  }

  // Use findFirst instead of findFirstOrThrow to handle missing wallet gracefully
  const wallet = await prisma.wallet.findFirst({
    where: {
      userId: payload.sub,
    },
  });

  // If user has no wallet, they definitely don't have a BONK ATA account
  if (!wallet) {
    return false;
  }

  try {
    const userWallet = new PublicKey(wallet.address);
    const bonkAddress = new PublicKey(process.env.NEXT_PUBLIC_BONK_ADDRESS!);

    const receiverAssociatedAddress = await getAssociatedTokenAddress(
      bonkAddress,
      userWallet,
    );

    const receiverAccountInfo = await CONNECTION.getAccountInfo(
      receiverAssociatedAddress,
    );

    return !!receiverAccountInfo;
  } catch (error) {
    // Log the error but don't throw - return false as fallback
    console.error("Error checking BONK ATA account:", error);
    return false;
  }
};
