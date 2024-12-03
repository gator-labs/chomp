"use server";

import { sendBonk } from "@/app/utils/claim";
import { ChompResult } from "@prisma/client";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";

export async function sendClaimedBonkFromTreasury(
  chompResults: ChompResult[],
  questionIds: number[],
  address: string,
) {
  const treasuryWallet = Keypair.fromSecretKey(
    base58.decode(process.env.CHOMP_TREASURY_PRIVATE_KEY || ""),
  );

  const tokenAmount = chompResults.reduce(
    (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
    0,
  );

  if (tokenAmount > 0) {
    const sendTx = await sendBonk(
      treasuryWallet,
      new PublicKey(address),
      Math.round(tokenAmount * 10 ** 5),
      chompResults,
      questionIds,
    );
    return sendTx;
  }

  return null;
}
