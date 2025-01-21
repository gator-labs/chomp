"use server";

import { getTreasuryPrivateKey } from "@/lib/env-vars";
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

export const getTreasuryAddress = async () => {
  const treasuryKey = getTreasuryPrivateKey();

  if (!treasuryKey) {
    return null;
  }

  const fromWallet = Keypair.fromSecretKey(base58.decode(treasuryKey));

  const treasuryAddress = fromWallet.publicKey.toString();

  return treasuryAddress;
};
