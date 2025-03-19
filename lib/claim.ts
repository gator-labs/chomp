"use server";

import { sendBonk } from "@/app/utils/sendBonk";
import { ChompResult, EChainTxType } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";

export async function sendClaimedBonkFromTreasury(
  chompResults: ChompResult[],
  address: string,
) {
  const tokenAmount = chompResults.reduce(
    (acc, cur) => acc + (cur.rewardTokenAmount?.toNumber() ?? 0),
    0,
  );

  if (tokenAmount > 0) {
    const sendTx = await sendBonk(
      new PublicKey(address),
      tokenAmount,
      EChainTxType.MysteryBoxClaim,
    );
    return sendTx.signature;
  }

  return null;
}
