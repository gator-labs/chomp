import { faker } from "@faker-js/faker";
import {
  TransactionFailedError,
  TransactionFailedToConfirmError,
} from "@/lib/error";
import { EChainTxType } from "@prisma/client";
import { EChainTxStatus } from "@prisma/client";
import {
  PublicKey,
} from "@solana/web3.js";
import "server-only";

import { getJwtPayload } from "../actions/jwt";
import prisma from "../services/prisma";

export const sendBonk = async (
  toWallet: PublicKey,
  amount: number,
  type: EChainTxType,
) => {
  const payload = await getJwtPayload();

  if (!payload) return null;

  const rawAmount = Math.round(amount * 10 ** 5);

  const bonkMint = new PublicKey(process.env.NEXT_PUBLIC_BONK_ADDRESS!);

  const signature = faker.string.hexadecimal({ length: 86, prefix: '' });

  await prisma.chainTx.create({
    data: {
      hash: signature,
      status: EChainTxStatus.New,
      solAmount: "0",
      wallet: 'CHoMP5YdLEJ62kq9oibKbNDkBCgakQPqQLSgkDHyC2D9',
      recipientAddress: toWallet.toBase58(),
      type: type,
      tokenAmount: amount.toString(),
      tokenAddress: bonkMint.toBase58(),
    },
  });

  return signature;
};
