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
import { getComputeUnits } from "../queries/getComputeUnitEstimate";
import { getRecentPrioritizationFees } from "../queries/getPriorityFeeEstimate";
import { pollTransactionConfirmation } from "../queries/pollTransactionConfirmation";

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


  let estimateFee = await getRecentPrioritizationFees(versionedTransaction);

  // Add the compute unit price instruction with the estimated fee
  const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: estimateFee.priorityFeeEstimate || 0,
  });

  instructions.unshift(computeBudgetIx);

  // Get the optimal compute units
  const unitsConsumed = await getComputeUnits(
    instructions,
    fromWallet.publicKey,
    [],
  )

  if (unitsConsumed) {
    // Add some margin to the compute units
    const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
      units: Math.ceil(unitsConsumed * 1.1),
    });

    instructions.unshift(computeUnitsIx);
  }

  const v0updatedMessage = new TransactionMessage({
    payerKey: fromWallet.publicKey,
    recentBlockhash: blockhash.blockhash,
    instructions,
  }).compileToV0Message();

  const updatedVersionedTransaction = new VersionedTransaction(v0updatedMessage);

  updatedVersionedTransaction.sign([fromWallet])

  // Re-fetch the blockhash every 4 retries, or, roughly once every minute
  const blockhashValidityThreshold = 4;

  let retryCount: number = 0;
  let txtSig: string;

  let maxRetries: number = 6
  let skipPreflightChecks: boolean = true


  // Send the transaction with configurable retries and preflight checks
  while (retryCount <= maxRetries) {
    try {
      // Check if the blockhash needs to be refreshed based on the retry count
      if (retryCount > 0 && retryCount % blockhashValidityThreshold === 0) {
        let latestBlockhash = (await CONNECTION.getLatestBlockhash()).blockhash;
        updatedVersionedTransaction.message.recentBlockhash = latestBlockhash;
        updatedVersionedTransaction.sign([fromWallet]);
      }

      txtSig = await CONNECTION.sendRawTransaction(updatedVersionedTransaction.serialize(), {
        skipPreflight: skipPreflightChecks,
        maxRetries: 0,
      });

      return await pollTransactionConfirmation(txtSig);
    } catch (error) {
      if (retryCount === maxRetries) {
        throw new Error(`Error sending transaction: ${error}`);
      }

      retryCount++;
    }
  }

  return null
};
