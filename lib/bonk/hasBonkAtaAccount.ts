"use server";

import { getJwtPayload } from "@/app/actions/jwt";
import prisma from "@/app/services/prisma";
import { CONNECTION } from "@/app/utils/solana";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const hasBonkAtaAccount = async () => {
  const payload = await getJwtPayload();

  if (!payload) throw new Error("Unauthorized");

  const wallet = await prisma.wallet.findFirstOrThrow({
    where: {
      userId: payload.sub,
    },
  });

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
};
