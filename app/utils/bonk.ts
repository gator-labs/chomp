"use server";

import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { CONNECTION } from "./solana";

export const sendBonk = async (
  fromWallet: Keypair,
  toWallet: PublicKey,
  amount: number,
) => {
  const bonkMint = new PublicKey(
    "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
  );

  const fromTokenAccount = await getAssociatedTokenAddress(
    bonkMint,
    fromWallet.publicKey,
  );
  const toTokenAccount = await getAssociatedTokenAddress(bonkMint, toWallet);

  const instruction = createTransferInstruction(
    fromTokenAccount,
    toTokenAccount,
    fromWallet.publicKey,
    amount,
  );

  const instructions = [];

  const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: 100_000,
  });
  instructions.push(addPriorityFee);
  instructions.push(instruction);

  const blockhash = await CONNECTION.getLatestBlockhash();

  const message = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const transaction = new VersionedTransaction(message);

  transaction.sign([fromWallet]);

  const signature = await CONNECTION.sendTransaction(transaction, {
    maxRetries: 10,
  });

  await CONNECTION.confirmTransaction(
    {
      signature,
      ...blockhash,
    },
    "confirmed",
  );

  return signature;
};
