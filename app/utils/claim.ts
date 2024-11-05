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

import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
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

  instructions.push(instruction);

  const blockhash = await CONNECTION.getLatestBlockhash();

  const v0message = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const versionedTransaction = new VersionedTransaction(v0message);

  versionedTransaction.sign([fromWallet]);

  const estimateFee = await getRecentPrioritizationFees(versionedTransaction);

  // Add the compute unit price instruction with the estimated fee
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: estimateFee?.result?.priorityFeeLevels?.high || 50000,
  });

  // update the instructions with compute budget instruction.
  instructions.unshift(computeBudgetIx);

  const computeUnitFix = 4794;

  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: computeUnitFix * 1.1,
  });

  // update the instructions with compute unit instruction (unshift will move compute unit to the start and it is recommended in docs as well.)
  instructions.unshift(computeUnitsIx);

  const v0updatedMessage = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const updatedVersionedTransaction = new VersionedTransaction(
    v0updatedMessage,
  );

  updatedVersionedTransaction.sign([fromWallet]);

  const signature = await CONNECTION.sendTransaction(
    updatedVersionedTransaction,
    {
      maxRetries: 10,
    },
  );

  await CONNECTION.confirmTransaction(
    {
      signature,
      ...blockhash,
    },
    "confirmed",
  );

  return signature;
};
