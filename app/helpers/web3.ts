import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || "");

export const findSplTokenPda = (
  pubKey: PublicKey,
  tokenMintAddress: PublicKey
): PublicKey => {
  return PublicKey.findProgramAddressSync(
    [
      pubKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
};
