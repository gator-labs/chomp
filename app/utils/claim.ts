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

import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import { CONNECTION } from "./solana";

export const sendBonk = async (
  fromWallet: Keypair,
  toWallet: PublicKey,
  amount: number,
) => {
  const bonkMint = new PublicKey(process.env.NEXT_PUBLIC_BONK_ADDRESS!);

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
    microLamports: Math.round(
      estimateFee?.result?.priorityFeeLevels?.high || HIGH_PRIORITY_FEE,
    ),
  });

  // update the instructions with compute budget instruction.
  instructions.unshift(computeBudgetIx);

  //refered from past transaction
  const computeUnitFix = 4794;
  // Buffer to make sure the transaction doesn't fail because of less compute units
  const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
    units: Math.round(computeUnitFix * 1.1),
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
