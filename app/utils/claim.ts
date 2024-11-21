"use server";

import { ChompResult } from "@prisma/client";
import * as Sentry from "@sentry/nextjs";
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

import { getJwtPayload } from "../actions/jwt";
import { HIGH_PRIORITY_FEE } from "../constants/fee";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import { CONNECTION } from "./solana";

export const sendBonk = async (
  fromWallet: Keypair,
  toWallet: PublicKey,
  amount: number,
  chompResults: ChompResult[],
  questionIds: number[],
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

  let blockhashResponse = await CONNECTION.getLatestBlockhash();

  const v0message = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhashResponse.blockhash,
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

  blockhashResponse = await CONNECTION.getLatestBlockhash();

  const v0updatedMessage = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhashResponse.blockhash,
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

  const payload = await getJwtPayload();

  try {
    await CONNECTION.confirmTransaction(
      {
        signature,
        ...blockhashResponse,
      },
      "confirmed",
    );
  } catch {
    // If the claim transaction is not confirmed in first trial, try again with a latest blockhash
    const blockhashResponse = await CONNECTION.getLatestBlockhash();
    try {
      await CONNECTION.confirmTransaction(
        {
          signature,
          ...blockhashResponse,
        },
        "confirmed",
      );
    } catch {
      // Record the error and send message to Slack
      Sentry.captureMessage(
        `User with id: ${payload?.sub} is having trouble claiming question IDs: ${questionIds} with transaction confirmation`,
        {
          tags: {
            category: "claim-tx-confirmation-error",
          },
          extra: {
            chompResults: chompResults.map((r) => r.id),
            transactionHash: signature,
          },
        },
      );
    }
  }

  return signature;
};
