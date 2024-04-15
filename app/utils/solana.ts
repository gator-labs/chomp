import { Transaction, PublicKey, Keypair } from "@solana/web3.js";
import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
} from "@solana/spl-token";
import * as bs58 from "bs58";

const BONK_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_BONK_ADDRESS!;
const AMOUNT_TO_SEND = 1; // 1 => 0.00001 BONK
const DECIMALS = 5;

export const genBonkBurnTx = async (
  ownerAddress: string,
  blockhash: string,
) => {
  const burnFromPublic = new PublicKey(ownerAddress);

  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS);
  let ata = await getAssociatedTokenAddress(
    bonkPublic, // mint
    burnFromPublic, // owner
  );

  const tx = new Transaction();
  tx.add(
    createBurnCheckedInstruction(
      ata,
      bonkPublic,
      burnFromPublic,
      AMOUNT_TO_SEND,
      DECIMALS,
    ),
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = burnFromPublic;

  return tx;
};

export const genBonkTransferTx = async (
  recipientAddress: string,
  blockhash: string,
) => {
  const bonkPublic = new PublicKey(BONK_PUBLIC_ADDRESS);

  const gatorTreasury = Keypair.fromSecretKey(
    bs58.decode(process.env.NEXT_PUBLIC_GATOR_TREASURY_PRIVATE_KEY!),
  );
  const gatorBonkAta = await getAssociatedTokenAddress(
    bonkPublic, // mint
    gatorTreasury.publicKey, // owner
  );

  const recipientKey = new PublicKey(recipientAddress);

  let recipientAta = await getAssociatedTokenAddress(
    bonkPublic, // mint
    recipientKey, // owner
  );

  const tx = new Transaction();
  tx.add(
    createTransferCheckedInstruction(
      gatorBonkAta,
      bonkPublic,
      recipientAta,
      gatorTreasury.publicKey,
      AMOUNT_TO_SEND,
      DECIMALS,
    ),
  );

  tx.recentBlockhash = blockhash;
  tx.feePayer = gatorTreasury.publicKey;

  return tx;
};
