"use server";

import { sendBonk } from "@/app/utils/claim";
import { ChompResult } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";

export async function sendClaimedBonkFromTreasury(
  chompResults: ChompResult[],
  questionIds: number[],
  address: string,
) {
  const tokenAmount = chompResults.reduce(
    (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
    0,
  );

  if (tokenAmount > 0) {
    const sendTx = await sendBonk(
      new PublicKey(address),
      Math.round(tokenAmount * 10 ** 5),
      chompResults,
      questionIds,
    );
    return sendTx;
  }

  return null;
}
